import test from 'node:test';
import assert from 'node:assert/strict';
import { createIdleVisitor, createVisitorActivityClassifier, idleVisitorDelay, visitorTargetInViewport } from '../src/hooks/idleVisitor.js';

function fakeClock() {
  let now = 0;
  let nextId = 0;
  const pending = new Map();
  const callbacks = [];
  const clock = {
    schedule(callback, delay) {
      const id = ++nextId;
      pending.set(id, { callback, at: now + delay });
      callbacks.push(callback);
      return id;
    },
    cancel(id) { pending.delete(id); },
    advance(duration) {
      const until = now + duration;
      for (;;) {
        const next = [...pending].sort((a, b) => a[1].at - b[1].at)[0];
        if (!next || next[1].at > until) break;
        const [id, job] = next;
        now = job.at;
        pending.delete(id);
        job.callback();
      }
      now = until;
    },
    callbacks,
    get pending() { return pending.size; },
  };
  return clock;
}

function setup(options = {}) {
  const clock = fakeClock();
  const updates = [];
  const visitor = createIdleVisitor({ schedule: clock.schedule, cancel: clock.cancel, onChange: value => updates.push(value), ...options });
  return { clock, visitor, updates };
}

test('visitor waits exactly 20 uninterrupted eligible seconds, without recurring timers', () => {
  const { clock, visitor, updates } = setup();
  clock.advance(idleVisitorDelay * 2);
  assert.equal(visitor.visible, false);
  assert.equal(clock.pending, 0);
  visitor.setEligible(true);
  clock.advance(idleVisitorDelay - 1);
  assert.equal(visitor.visible, false);
  clock.advance(1);
  assert.equal(visitor.visible, true);
  assert.deepEqual(updates, [true]);
  assert.equal(clock.pending, 0);
  clock.advance(idleVisitorDelay * 3);
  assert.deepEqual(updates, [true]);
});

test('activity resets a full countdown and dismisses an already-visible visitor', () => {
  const { clock, visitor, updates } = setup();
  visitor.setEligible(true);
  clock.advance(19_999);
  visitor.reset();
  assert.equal(clock.pending, 1);
  clock.advance(19_999);
  assert.equal(visitor.visible, false);
  clock.advance(1);
  visitor.reset();
  assert.equal(visitor.visible, false);
  assert.deepEqual(updates, [true, false]);
  clock.advance(20_000);
  assert.deepEqual(updates, [true, false, true]);
});

test('ineligible menu, blur, hidden document or offscreen resets rather than pausing elapsed time', () => {
  for (const reason of ['mode', 'blur', 'hidden', 'offscreen']) {
    const { clock, visitor, updates } = setup();
    visitor.setEligible(true);
    clock.advance(19_999);
    visitor.setEligible(false);
    clock.advance(60_000);
    assert.deepEqual(updates, [], reason);
    visitor.setEligible(true);
    clock.advance(19_999);
    assert.equal(visitor.visible, false, reason);
    clock.advance(1);
    assert.equal(visitor.visible, true, reason);
    visitor.setEligible(false);
    assert.deepEqual(updates, [true, false], reason);
    assert.equal(clock.pending, 0, reason);
  }
});

test('repeated eligibility observations do not starve the timer or hide a visible visitor', () => {
  const { clock, visitor, updates } = setup();
  visitor.setEligible(true);
  clock.advance(10_000);
  visitor.setEligible(true);
  clock.advance(10_000);
  visitor.setEligible(true);
  assert.deepEqual(updates, [true]);
  assert.equal(clock.pending, 0);
});

test('cancelled callbacks and disposed StrictMode mounts cannot reveal the visitor', () => {
  const { clock, visitor, updates } = setup();
  visitor.setEligible(true);
  const stale = clock.callbacks[0];
  visitor.reset();
  stale();
  assert.equal(visitor.visible, false);
  visitor.dispose();
  clock.callbacks.forEach(callback => callback());
  visitor.setEligible(true);
  visitor.reset();
  visitor.dispose();
  clock.advance(40_000);
  assert.deepEqual(updates, []);
  assert.equal(clock.pending, 0);
  const fresh = createIdleVisitor({ schedule: clock.schedule, cancel: clock.cancel, onChange: value => updates.push(value) });
  fresh.setEligible(true);
  clock.advance(20_000);
  assert.deepEqual(updates, [true]);
});

test('disposing a visible controller does not invoke React callbacks during cleanup', () => {
  const { clock, visitor, updates } = setup();
  visitor.setEligible(true);
  clock.advance(20_000);
  visitor.dispose();
  assert.equal(visitor.visible, false);
  assert.deepEqual(updates, [true]);
});

test('invalid idle durations are rejected', () => {
  for (const delay of [0, -1, Infinity, NaN]) assert.throws(() => createIdleVisitor({ delay }), RangeError);
});

const guestTarget = { closest: selector => selector === '.tiny-visitor-trigger' ? {} : null };

test('ordinary input and repeated keyboard events count as activity before reveal', () => {
  const classify = createVisitorActivityClassifier();
  for (const type of ['keydown', 'pointerdown', 'touchstart', 'wheel', 'scroll']) {
    assert.equal(classify({ type, key: 'Tab', repeat: true }), true, type);
  }
  assert.equal(classify({ type: 'focusin' }), false);
});

test('pointer jitter under three pixels is ignored, but accumulated motion resets the clock', () => {
  const classify = createVisitorActivityClassifier();
  const move = (x, y, visible = false) => classify({ type: 'pointermove', clientX: x, clientY: y }, visible);
  assert.equal(move(20, 20), true);
  assert.equal(move(21, 20), false);
  assert.equal(move(22, 20), false);
  assert.equal(move(23, 20), true);
  assert.equal(move(23, 23), true);
  assert.equal(move(NaN, 20), false);
  assert.equal(move(800, 500, true), false);
});

test('visible visitor can be approached, tapped or activated without the input hiding it first', () => {
  const classify = createVisitorActivityClassifier();
  for (const type of ['pointerdown', 'touchstart']) {
    assert.equal(classify({ type, target: guestTarget }, true), false);
    assert.equal(classify({ type }, true), true);
  }
  for (const key of ['Enter', ' ', 'Spacebar']) {
    assert.equal(classify({ type: 'keydown', key, target: guestTarget }, true), false);
    assert.equal(classify({ type: 'keydown', key }, true), true);
  }
  for (const key of ['ArrowUp', 'ArrowRight', 'Escape', 'a']) {
    assert.equal(classify({ type: 'keydown', key, target: guestTarget }, true), true);
  }
  assert.equal(classify({ type: 'wheel', target: guestTarget }, true), true);
});

test('Tab and Shift+Tab preserve a visible visitor even before its button receives focus', () => {
  const classify = createVisitorActivityClassifier();
  for (const shiftKey of [false, true]) {
    assert.equal(classify({ type: 'keydown', key: 'Tab', shiftKey }, true), false);
    assert.equal(classify({ type: 'keydown', key: 'Tab', shiftKey }), true);
    assert.equal(classify({ type: 'keydown', key: 'Tab', shiftKey, target: guestTarget }, true), false);
  }
  for (const key of ['Shift', 'Control', 'Alt', 'Meta']) {
    assert.equal(classify({ type: 'keydown', key }, true), false);
    assert.equal(classify({ type: 'keydown', key }), true);
  }
});

test('native focus scrolling preserves a visible visitor while real scrolling input resets it', () => {
  const classify = createVisitorActivityClassifier();
  assert.equal(classify({ type: 'scroll' }), true);
  assert.equal(classify({ type: 'scroll' }, true), false);
  assert.equal(classify({ type: 'wheel' }, true), true);
  assert.equal(classify({ type: 'touchstart' }, true), true);
  assert.equal(classify({ type: 'keydown', key: 'PageDown' }, true), true);
});

test('viewport fallback uses visible area and includes exactly the 35 percent boundary', () => {
  assert.equal(visitorTargetInViewport({ left: 0, top: 65, width: 100, height: 100 }, 100, 100), true);
  assert.equal(visitorTargetInViewport({ left: 0, top: 65.1, width: 100, height: 100 }, 100, 100), false);
  assert.equal(visitorTargetInViewport({ left: -65, top: 0, width: 100, height: 100 }, 100, 100), true);
  assert.equal(visitorTargetInViewport({ left: -50, top: -50, width: 100, height: 100 }, 100, 100), false);
  assert.equal(visitorTargetInViewport({ left: 100, top: 0, width: 100, height: 100 }, 100, 100), false);
  assert.equal(visitorTargetInViewport({ left: 0, top: 0, width: 0, height: 100 }, 100, 100), false);
  assert.equal(visitorTargetInViewport({ left: 0, top: NaN, width: 100, height: 100 }, 100, 100), false);
  assert.equal(visitorTargetInViewport(null, 100, 100), false);
});
