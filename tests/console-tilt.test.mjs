import test from 'node:test';
import assert from 'node:assert/strict';
import { bindConsoleTilt, getConsoleTilt } from '../src/hooks/useConsoleTilt.js';

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

function setup({ fine = true, reduced = false } = {}) {
  const frames = new Map();
  const values = new Map();
  let frameId = 0;
  let time = 0;
  let observerCallback;
  let observerDisconnected = false;
  const pointer = { ...emitter(), matches: fine };
  const motion = { ...emitter(), matches: reduced };
  const doc = { ...emitter(), hidden: false, body: {}, dialogOpen: false,
    querySelector() { return this.dialogOpen ? {} : null; },
  };
  const element = { dataset: {}, style: {
    getPropertyValue: property => values.get(property) ?? '',
    getPropertyPriority: () => '',
    setProperty: (property, value) => values.set(property, value),
    removeProperty: property => values.delete(property),
  } };
  const host = { ...emitter(), document: doc, innerWidth: 1000, innerHeight: 800,
    matchMedia: query => query.includes('hover') ? pointer : motion,
    requestAnimationFrame(callback) { frames.set(++frameId, callback); return frameId; },
    cancelAnimationFrame: id => frames.delete(id),
    MutationObserver: class {
      constructor(callback) { observerCallback = callback; }
      observe() {}
      disconnect() { observerDisconnected = true; }
    },
  };
  const cleanup = bindConsoleTilt(element, host);
  function settle() {
    for (let count = 0; frames.size; count += 1) {
      assert.ok(count < 200, 'animation stops when the target is reached');
      const callbacks = [...frames.values()];
      frames.clear();
      time += 16;
      callbacks.forEach(callback => callback(time));
    }
  }
  function move(overConsole = false, pointerType = 'mouse') {
    host.emit('pointermove', { clientX: 1000, clientY: 0, pointerType,
      target: { closest: () => overConsole ? {} : null },
    });
  }
  return { host, doc, element, pointer, motion, frames, values, cleanup, settle, move,
    openDialog() { doc.dialogOpen = true; observerCallback(); },
    disconnected: () => observerDisconnected,
  };
}

test('viewport mapping is centered and bounded to three/five degrees', () => {
  assert.deepEqual(getConsoleTilt(500, 400, 1000, 800), { x: 0, y: 0 });
  assert.deepEqual(getConsoleTilt(0, 0, 1000, 800), { x: 3, y: -5 });
  assert.deepEqual(getConsoleTilt(1000, 800, 1000, 800), { x: -3, y: 5 });
  assert.deepEqual(getConsoleTilt(-100, 900, 1000, 800), { x: -3, y: -5 });
  assert.deepEqual(getConsoleTilt(0, 0, 0, 800), { x: 0, y: 0 });
  assert.deepEqual(getConsoleTilt(NaN, 0, 1000, 800), { x: 0, y: 0 });
});

test('outside pointer movement is eased without keeping an idle animation loop', () => {
  const instance = setup();
  instance.move();
  assert.equal(instance.frames.size, 1);
  instance.move();
  assert.equal(instance.frames.size, 1, 'pointer events share one animation frame');
  instance.settle();
  assert.equal(instance.values.get('--tilt-x'), '3.000deg');
  assert.equal(instance.values.get('--tilt-y'), '5.000deg');
  assert.equal(instance.frames.size, 0);
  instance.cleanup();
});

test('the console freezes its visible angle on control entry without moving the click target', () => {
  const instance = setup();
  instance.move();
  instance.settle();
  instance.host.emit('pointermove', { clientX: 0, clientY: 800, pointerType: 'mouse',
    target: { closest: () => null },
  });
  assert.equal(instance.frames.size, 1, 'the next external position starts easing');
  instance.move(true);
  assert.equal(instance.frames.size, 0, 'control entry immediately cancels pending motion');
  assert.equal(instance.values.get('--tilt-x'), '3.000deg');
  assert.equal(instance.values.get('--tilt-y'), '5.000deg');
  instance.move(true);
  assert.equal(instance.frames.size, 0, 'movement within the controls keeps the angle frozen');
  instance.host.emit('pointermove', { clientX: 500, clientY: 400, pointerType: 'mouse',
    target: { closest: () => null },
  });
  instance.settle();
  assert.equal(instance.values.get('--tilt-y'), '0.000deg', 'external movement resumes easing');
  instance.cleanup();
});

test('coarse pointers and reduced-motion preferences disable motion and can change live', () => {
  for (const options of [{ fine: false }, { reduced: true }]) {
    const instance = setup(options);
    instance.move();
    assert.equal(instance.frames.size, 0);
    instance.pointer.matches = true;
    instance.motion.matches = false;
    instance.motion.emit('change');
    instance.move();
    instance.settle();
    assert.equal(instance.values.get('--tilt-y'), '5.000deg');
    instance.motion.matches = true;
    instance.motion.emit('change');
    assert.equal(instance.values.get('--tilt-y'), '0.000deg');
    instance.move();
    assert.equal(instance.frames.size, 0);
    instance.cleanup();
  }
});

test('manual dragging freezes automatic tilt even when the captured pointer leaves the case', () => {
  const instance = setup();
  instance.move();
  instance.settle();
  instance.element.dataset.dragging = 'true';
  instance.host.emit('pointermove', { clientX: 0, clientY: 800, pointerType: 'mouse', target: { closest: () => null } });
  assert.equal(instance.frames.size, 0);
  assert.equal(instance.values.get('--tilt-x'), '3.000deg');
  assert.equal(instance.values.get('--tilt-y'), '5.000deg');
  instance.element.dataset.dragging = 'false';
  instance.host.emit('pointermove', { clientX: 0, clientY: 800, pointerType: 'mouse', target: { closest: () => null } });
  instance.settle();
  assert.equal(instance.values.get('--tilt-y'), '-5.000deg');
  instance.cleanup();
});

test('touch, blur, pointer leave, resizing and a hidden document cancel motion', () => {
  const instance = setup();
  const resetActions = [
    () => instance.move(false, 'touch'),
    () => instance.host.emit('blur'),
    () => instance.doc.emit('pointerleave'),
    () => instance.host.emit('resize'),
    () => { instance.doc.hidden = true; instance.doc.emit('visibilitychange'); },
  ];
  for (const reset of resetActions) {
    instance.move();
    assert.equal(instance.frames.size, 1);
    reset();
    assert.equal(instance.frames.size, 0);
    assert.equal(instance.values.get('--tilt-y'), '0.000deg');
    instance.doc.hidden = false;
  }
  instance.cleanup();
});

test('opening a dialog with no pointer movement neutralizes the console', () => {
  const instance = setup();
  instance.move();
  instance.settle();
  instance.openDialog();
  assert.equal(instance.values.get('--tilt-y'), '0.000deg');
  instance.move();
  assert.equal(instance.frames.size, 0);
  instance.cleanup();
});

test('cleanup cancels frames, removes styles, observers and every event listener', () => {
  const instance = setup();
  instance.move();
  instance.cleanup();
  assert.equal(instance.frames.size, 0);
  assert.equal(instance.values.size, 0);
  assert.equal(instance.disconnected(), true);
  for (const source of [instance.host, instance.doc, instance.pointer, instance.motion]) {
    for (const listeners of source.listeners.values()) assert.equal(listeners.size, 0);
  }
});
