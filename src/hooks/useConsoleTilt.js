import { useEffect } from 'react';

const POINTER_QUERY = '(hover: hover) and (pointer: fine)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function getConsoleTilt(clientX, clientY, width, height) {
  if (![clientX, clientY, width, height].every(Number.isFinite) || width <= 0 || height <= 0) {
    return { x: 0, y: 0 };
  }
  const horizontal = clamp(clientX / width * 2 - 1, -1, 1);
  const vertical = clamp(clientY / height * 2 - 1, -1, 1);
  return { x: vertical === 0 ? 0 : -vertical * 3, y: horizontal * 5 };
}

// Keep motion outside React so pointer movement never re-renders the LCD or game.
export function bindConsoleTilt(element, host = window) {
  if (!element || !host.matchMedia) return () => {};
  const doc = host.document;
  const finePointer = host.matchMedia(POINTER_QUERY);
  const reducedMotion = host.matchMedia(REDUCED_MOTION_QUERY);
  const previousStyles = ['--tilt-x', '--tilt-y'].map(property => ({
    property,
    value: element.style.getPropertyValue(property),
    priority: element.style.getPropertyPriority(property),
  }));
  let enabled = finePointer.matches && !reducedMotion.matches;
  let current = { x: 0, y: 0 };
  let target = { x: 0, y: 0 };
  let frame = null;
  let previousTime = null;

  function paint() {
    element.style.setProperty('--tilt-x', `${current.x.toFixed(3)}deg`);
    element.style.setProperty('--tilt-y', `${current.y.toFixed(3)}deg`);
  }

  function reset() {
    if (frame !== null) host.cancelAnimationFrame(frame);
    frame = null;
    previousTime = null;
    current = { x: 0, y: 0 };
    target = { x: 0, y: 0 };
    paint();
  }

  function freeze() {
    if (frame !== null) host.cancelAnimationFrame(frame);
    frame = null;
    previousTime = null;
    target = { ...current };
  }

  function animate(time) {
    frame = null;
    const elapsed = previousTime === null ? 16 : clamp(time - previousTime, 1, 64);
    previousTime = time;
    const easing = 1 - Math.exp(-elapsed / 90);
    for (const axis of ['x', 'y']) {
      current[axis] += (target[axis] - current[axis]) * easing;
      if (Math.abs(target[axis] - current[axis]) < 0.01) current[axis] = target[axis];
    }
    paint();
    if (current.x !== target.x || current.y !== target.y) {
      frame = host.requestAnimationFrame(animate);
    } else {
      previousTime = null;
    }
  }

  function moveTo(next) {
    target = next;
    if (frame === null && (current.x !== target.x || current.y !== target.y)) {
      frame = host.requestAnimationFrame(animate);
    }
  }

  function onPointerMove(event) {
    if (!enabled || doc.hidden) return;
    if (event.pointerType === 'touch') {
      reset();
      return;
    }
    if (doc.querySelector('dialog[open]')) {
      reset();
      return;
    }
    if (event.target?.closest?.('.handheld')) {
      // Hold the visible angle on entry so controls cannot move away from a
      // click while the console would otherwise ease back to its resting pose.
      freeze();
      return;
    }
    moveTo(getConsoleTilt(event.clientX, event.clientY, host.innerWidth, host.innerHeight));
  }

  function onPreferenceChange() {
    enabled = finePointer.matches && !reducedMotion.matches;
    reset();
  }

  function onVisibilityChange() {
    if (doc.hidden) reset();
  }

  // Opening a dialog with the keyboard must also settle the console, even if
  // the pointer stays outside it and no new pointer event arrives.
  const observer = host.MutationObserver ? new host.MutationObserver(() => {
    if (doc.querySelector('dialog[open]')) reset();
  }) : null;
  if (doc.body) observer?.observe(doc.body, { attributes: true, attributeFilter: ['open'], subtree: true });

  host.addEventListener('pointermove', onPointerMove, { passive: true });
  host.addEventListener('blur', reset);
  host.addEventListener('resize', reset);
  doc.addEventListener('pointerleave', reset);
  doc.addEventListener('visibilitychange', onVisibilityChange);
  finePointer.addEventListener('change', onPreferenceChange);
  reducedMotion.addEventListener('change', onPreferenceChange);

  return () => {
    reset();
    host.removeEventListener('pointermove', onPointerMove);
    host.removeEventListener('blur', reset);
    host.removeEventListener('resize', reset);
    doc.removeEventListener('pointerleave', reset);
    doc.removeEventListener('visibilitychange', onVisibilityChange);
    finePointer.removeEventListener('change', onPreferenceChange);
    reducedMotion.removeEventListener('change', onPreferenceChange);
    observer?.disconnect();
    for (const { property, value, priority } of previousStyles) {
      if (value) element.style.setProperty(property, value, priority);
      else element.style.removeProperty(property);
    }
  };
}

export function useConsoleTilt(motionRef) {
  useEffect(() => bindConsoleTilt(motionRef.current), [motionRef]);
}
