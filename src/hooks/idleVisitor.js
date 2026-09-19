export const idleVisitorDelay = 20_000;
export const idleVisitorVisibility = 0.35;

/** An eligibility-gated clock. Nothing here discovers a secret or moves focus. */
export function createIdleVisitor({
  delay = idleVisitorDelay,
  schedule = (callback, wait) => setTimeout(callback, wait),
  cancel = timer => clearTimeout(timer),
  onChange = () => {},
} = {}) {
  if (!Number.isFinite(delay) || delay <= 0) throw new RangeError('A positive idle delay is required.');
  let eligible = false;
  let visible = false;
  let disposed = false;
  let timer = null;
  let generation = 0;

  function clear() {
    generation += 1;
    if (timer !== null) cancel(timer);
    timer = null;
  }

  function publish(next) {
    if (visible === next) return;
    visible = next;
    onChange(next);
  }

  function reset() {
    if (disposed) return;
    clear();
    publish(false);
    if (!eligible) return;
    const version = generation;
    timer = schedule(() => {
      if (disposed || !eligible || generation !== version) return;
      timer = null;
      publish(true);
    }, delay);
  }

  function setEligible(next) {
    if (disposed || eligible === Boolean(next)) return;
    eligible = Boolean(next);
    reset();
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    eligible = false;
    clear();
    // Cleanup has no React callbacks; the next eligible mount starts fresh.
    visible = false;
  }

  return { setEligible, reset, dispose, get visible() { return visible; } };
}

/** Filter tiny pointer jitter while allowing an already-visible guest to be approached. */
export function createVisitorActivityClassifier() {
  let previousPointer = null;
  return (event, visible = false) => {
    const insideVisitor = Boolean(event.target?.closest?.('.tiny-visitor-trigger'));
    if (event.type === 'pointermove') {
      if (visible) return false;
      const { clientX: x, clientY: y } = event;
      if (!Number.isFinite(x) || !Number.isFinite(y)) return false;
      if (previousPointer && Math.hypot(x - previousPointer.x, y - previousPointer.y) < 3) return false;
      previousPointer = { x, y };
      return true;
    }
    if (event.type === 'keydown') {
      // Tab must stay available even outside the guest so keyboard users can reach it.
      if (visible && (['Tab', 'Shift', 'Control', 'Alt', 'Meta'].includes(event.key)
        || (insideVisitor && ['Enter', ' ', 'Spacebar'].includes(event.key)))) return false;
      return true;
    }
    if (event.type === 'pointerdown' || event.type === 'touchstart') return !(visible && insideVisitor);
    // Native focus may scroll the guest into view; real wheel/touch/key input
    // still resets it, and viewport eligibility handles scrolling it offscreen.
    return event.type === 'wheel' || (event.type === 'scroll' && !visible);
  };
}

/** Geometry fallback for browsers without IntersectionObserver. */
export function visitorTargetInViewport(bounds, width, height) {
  if (!bounds || ![bounds.left, bounds.top, bounds.width, bounds.height, width, height].every(Number.isFinite)
    || bounds.width <= 0 || bounds.height <= 0 || width <= 0 || height <= 0) return false;
  const right = bounds.left + bounds.width;
  const bottom = bounds.top + bounds.height;
  const shownWidth = Math.max(0, Math.min(right, width) - Math.max(bounds.left, 0));
  const shownHeight = Math.max(0, Math.min(bottom, height) - Math.max(bounds.top, 0));
  return shownWidth * shownHeight / (bounds.width * bounds.height) >= idleVisitorVisibility;
}
