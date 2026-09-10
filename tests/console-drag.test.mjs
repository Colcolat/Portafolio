import test from 'node:test';
import assert from 'node:assert/strict';
import { bindConsoleDrag } from '../src/hooks/consoleDrag.js';

function emitter() {
  const listeners = new Map();
  return {
    listeners,
    addEventListener(type, listener) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(listener);
    },
    removeEventListener(type, listener) { listeners.get(type)?.delete(listener); },
    emit(type, event = {}) { listeners.get(type)?.forEach(listener => listener(event)); },
  };
}

function setup({ capture = 'supported', canStart = event => event.casing } = {}) {
  const doc = { ...emitter(), hidden: false };
  const timers = new Map();
  const captures = new Set();
  const poses = [];
  const dragging = [];
  const checks = [];
  let timerId = 0;
  const host = { ...emitter(), document: doc,
    setTimeout(callback, delay) { timers.set(++timerId, { callback, delay }); return timerId; },
    clearTimeout(id) { timers.delete(id); },
  };
  const element = { ...emitter(), clientWidth: 400 };
  if (capture !== 'missing') {
    element.setPointerCapture = id => {
      if (capture === 'throws') throw new Error('Capture unavailable');
      captures.add(id);
    };
    element.hasPointerCapture = id => captures.has(id);
    element.releasePointerCapture = id => {
      captures.delete(id);
      element.emit('lostpointercapture', { pointerId: id });
    };
  }
  const binding = bindConsoleDrag(element, {
    canStart(event) { checks.push(event); return canStart(event); },
    onPose: pose => poses.push(pose),
    onDraggingChange: value => dragging.push(value),
  }, host);
  function event(overrides = {}) {
    return { pointerId: 7, pointerType: 'mouse', isPrimary: true, button: 0, buttons: 1,
      clientX: 100, clientY: 100, detail: 1, casing: true,
      prevented: false, stopped: false,
      preventDefault() { this.prevented = true; },
      stopImmediatePropagation() { this.stopped = true; },
      ...overrides,
    };
  }
  function down(overrides) {
    const pointer = event(overrides);
    host.emit('pointerdown', pointer);
    element.emit('pointerdown', pointer);
    return pointer;
  }
  function move(overrides) {
    const pointer = event(overrides);
    host.emit('pointermove', pointer);
    return pointer;
  }
  function up(overrides) {
    const pointer = event({ buttons: 0, ...overrides });
    host.emit('pointerup', pointer);
    return pointer;
  }
  function click(overrides) {
    const pointer = event(overrides);
    host.emit('click', pointer);
    return pointer;
  }
  return { host, doc, element, timers, captures, poses, dragging, checks,
    binding, event, down, move, up, click };
}

test('protected controls and misses remain untouched, including ordinary clicks', () => {
  const instance = setup();
  const pointer = instance.down({ casing: false });
  assert.equal(pointer.prevented, false);
  assert.equal(instance.checks.length, 1);
  assert.equal(instance.captures.size, 0);
  assert.equal(instance.move({ clientX: 400 }).prevented, false);
  instance.up();
  assert.equal(instance.click().prevented, false);
  assert.deepEqual(instance.poses, []);
  assert.deepEqual(instance.dragging, []);
  instance.binding.dispose();
});

test('only primary left-button mouse and pen gestures can start rotation', () => {
  const instance = setup();
  for (const overrides of [
    { pointerType: 'touch' }, { pointerType: '' }, { button: 1 }, { button: 2 },
    { isPrimary: false }, { clientX: NaN },
  ]) assert.equal(instance.down(overrides).prevented, false);
  assert.equal(instance.checks.length, 0, 'excluded pointers never enter hit testing');
  assert.equal(instance.down({ pointerType: 'pen' }).prevented, true);
  assert.deepEqual(instance.dragging, [true]);
  instance.binding.dispose();
});

test('a held casing click does not rotate until movement reaches four pixels', () => {
  const instance = setup();
  assert.equal(instance.down().prevented, true);
  assert.equal(instance.captures.has(7), true);
  assert.deepEqual(instance.dragging, [true]);
  assert.equal(instance.move({ clientX: 103 }).prevented, true);
  assert.deepEqual(instance.poses, []);
  instance.up({ clientX: 103 });
  assert.deepEqual(instance.dragging, [true, false]);
  assert.equal(instance.click().prevented, false, 'a stationary casing click is ordinary');
  instance.down();
  instance.move({ clientX: 104 });
  assert.deepEqual(instance.poses.at(-1), { x: 0, y: 1.8 });
  instance.up({ clientX: 104 });
  assert.equal(instance.poses.length, 1, 'finishing does not round or repaint an in-range yaw');
  instance.binding.dispose();
});

test('rotation is normalized to casing width and accumulated between gestures', () => {
  const instance = setup();
  instance.down();
  instance.move({ clientX: 300, clientY: 150 });
  assert.deepEqual(instance.poses.at(-1), { x: 15, y: 90 });
  instance.up({ clientX: 300, clientY: 150 });
  assert.deepEqual(instance.poses.at(-1), { x: 15, y: 90 });
  instance.down({ clientX: 300, clientY: 150 });
  instance.move({ clientX: 400, clientY: 100 });
  assert.deepEqual(instance.poses.at(-1), { x: 0, y: 135 });
  instance.up({ clientX: 400, clientY: 100 });
  assert.deepEqual(instance.dragging, [true, false, true, false]);
  instance.binding.dispose();
});

test('pitch is bounded and yaw wraps only when the gesture finishes', () => {
  const instance = setup();
  instance.down();
  instance.move({ clientX: 1100, clientY: 1100 });
  assert.deepEqual(instance.poses.at(-1), { x: 55, y: 450 });
  instance.up({ clientX: 1100, clientY: 1100 });
  assert.deepEqual(instance.poses.at(-1), { x: 55, y: 90 });
  instance.down();
  instance.move({ clientX: -900, clientY: -900 });
  assert.deepEqual(instance.poses.at(-1), { x: -55, y: -360 });
  instance.up({ clientX: -900, clientY: -900 });
  assert.deepEqual(instance.poses.at(-1), { x: -55, y: 0 });
  instance.binding.dispose();
});

test('other pointers cannot change or end a captured gesture', () => {
  const instance = setup();
  instance.down();
  assert.equal(instance.move({ pointerId: 8, pointerType: 'touch', clientX: 400 }).prevented, false);
  instance.up({ pointerId: 8 });
  instance.doc.emit('pointerleave', { pointerId: 8, pointerType: 'touch' });
  assert.deepEqual(instance.dragging, [true]);
  assert.deepEqual(instance.poses, []);
  instance.up();
  assert.deepEqual(instance.dragging, [true, false]);
  instance.binding.dispose();
});

test('window release finishes outside the element even without pointer capture', () => {
  for (const capture of ['supported', 'missing', 'throws']) {
    const instance = setup({ capture });
    instance.down();
    instance.move({ clientX: 300 });
    instance.up({ clientX: 300 });
    assert.deepEqual(instance.dragging, [true, false]);
    assert.equal(instance.captures.size, 0);
    const count = instance.poses.length;
    assert.equal(instance.move({ clientX: 400 }).prevented, false);
    assert.equal(instance.poses.length, count);
    instance.binding.dispose();
  }
});

test('lost capture, cancellation, blur, document exit and hiding never leave a stuck drag', () => {
  const endings = [
    instance => instance.element.emit('lostpointercapture', { pointerId: 7 }),
    instance => instance.host.emit('pointercancel', { pointerId: 7 }),
    instance => instance.host.emit('blur'),
    instance => instance.doc.emit('pointerleave'),
    instance => { instance.doc.hidden = true; instance.doc.emit('visibilitychange'); },
    instance => instance.move({ buttons: 0, clientX: 200 }),
  ];
  for (const end of endings) {
    const instance = setup();
    instance.down();
    instance.move({ clientX: 200 });
    end(instance);
    assert.deepEqual(instance.dragging, [true, false]);
    assert.equal(instance.captures.size, 0);
    assert.deepEqual(instance.poses.at(-1), { x: 0, y: 45 });
    assert.equal(instance.move({ clientX: 300 }).prevented, false);
    instance.binding.dispose();
  }
});

test('only the immediate gesture click is suppressed after actual movement', () => {
  const instance = setup();
  instance.down();
  instance.move({ clientX: 300 });
  instance.up({ clientX: 300 });
  assert.equal(instance.timers.size, 1);
  assert.equal(instance.click({ detail: 0 }).prevented, false, 'keyboard clicks remain available');
  assert.equal(instance.click({ pointerId: 8 }).prevented, false, 'other pointers remain available');
  const generated = instance.click();
  assert.equal(generated.prevented, true);
  assert.equal(generated.stopped, true);
  assert.equal(instance.timers.size, 0);
  assert.equal(instance.click().prevented, false, 'suppression is consumed once');
  instance.binding.dispose();
});

test('new pointer gestures and the short timeout clear stale click suppression', () => {
  for (const clear of [
    instance => instance.down({ casing: false }),
    instance => {
      assert.equal([...instance.timers.values()][0].delay, 300);
      [...instance.timers.values()][0].callback();
    },
  ]) {
    const instance = setup();
    instance.down();
    instance.move({ clientX: 300 });
    instance.up({ clientX: 300 });
    clear(instance);
    assert.equal(instance.click().prevented, false);
    assert.equal(instance.timers.size, 0);
    instance.binding.dispose();
  }
});

test('reset recenters immediately and disposals release all listeners, timers and capture', () => {
  const instance = setup();
  instance.down();
  instance.move({ clientX: 300, clientY: 200 });
  instance.binding.reset();
  assert.deepEqual(instance.poses.at(-1), { x: 0, y: 0 });
  assert.deepEqual(instance.dragging, [true, false]);
  assert.equal(instance.captures.size, 0);
  assert.equal(instance.click().prevented, false);
  instance.down();
  instance.move({ clientX: 140 });
  assert.deepEqual(instance.poses.at(-1), { x: 0, y: 18 });
  instance.binding.dispose();
  instance.binding.dispose();
  instance.binding.reset();
  assert.deepEqual(instance.dragging, [true, false, true, false]);
  assert.equal(instance.captures.size, 0);
  assert.equal(instance.timers.size, 0);
  for (const source of [instance.element, instance.host, instance.doc]) {
    for (const listeners of source.listeners.values()) assert.equal(listeners.size, 0);
  }
});

test('a zero-width or detached console never starts an unusable gesture', () => {
  const instance = setup();
  instance.element.clientWidth = 0;
  assert.equal(instance.down().prevented, false);
  assert.deepEqual(instance.dragging, []);
  instance.binding.dispose();
});

test('turning the console over synchronizes the next drag origin without a jump', () => {
  const instance = setup();
  instance.binding.setPose({ x: 0, y: 180 });
  assert.deepEqual(instance.poses.at(-1), { x: 0, y: 180 });
  instance.down();
  instance.move({ clientX: 104, clientY: 100 });
  assert.deepEqual(instance.poses.at(-1), { x: 0, y: 181.8 });
  instance.up({ clientX: 104, clientY: 100 });
  assert.ok(Math.abs(instance.poses.at(-1).y + 178.2) < 1e-10, 'release wraps the same physical rear pose');
  instance.binding.reset();
  instance.down();
  instance.move({ clientX: 120 });
  assert.deepEqual(instance.poses.at(-1), { x: 0, y: 9 }, 'reset synchronizes the following front drag too');
  instance.binding.dispose();
});

test('setting a pose cancels capture and any pending gesture click suppression', () => {
  for (const released of [false, true]) {
    const instance = setup();
    instance.down();
    instance.move({ clientX: 300 });
    if (released) instance.up({ clientX: 300 });
    instance.binding.setPose({ x: 12, y: 180 });
    assert.equal(instance.captures.size, 0);
    assert.equal(instance.timers.size, 0);
    assert.equal(instance.click().prevented, false, 'a keyboard flip must not leave a swallowed click');
    assert.deepEqual(instance.dragging, [true, false]);
    assert.deepEqual(instance.poses.at(-1), { x: 12, y: 180 });
    const count = instance.poses.length;
    instance.move({ clientX: 500 });
    instance.up({ clientX: 500 });
    assert.equal(instance.poses.length, count, 'the previous pointer cannot resume its canceled gesture');
    instance.binding.dispose();
  }
});

test('programmatic poses are finite, pitch-limited, yaw-normalized and inert after disposal', () => {
  const instance = setup();
  for (const [input, expected] of [
    [{ x: 500, y: 765 }, { x: 55, y: 45 }],
    [{ x: -500, y: -765 }, { x: -55, y: -45 }],
    [{ x: NaN, y: Infinity }, { x: 0, y: 0 }],
    [{ x: '10', y: '-90' }, { x: 0, y: 0 }],
    [null, { x: 0, y: 0 }],
    [undefined, { x: 0, y: 0 }],
  ]) {
    instance.binding.setPose(input);
    assert.deepEqual(instance.poses.at(-1), expected);
  }
  instance.binding.dispose();
  const count = instance.poses.length;
  instance.binding.setPose({ x: 20, y: 180 });
  assert.equal(instance.poses.length, count);
});
