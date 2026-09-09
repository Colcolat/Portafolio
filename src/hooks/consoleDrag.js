const DRAG_THRESHOLD = 4;
const CLICK_SUPPRESSION_MS = 300;

const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));
const wrapYaw = value => ((value + 180) % 360 + 360) % 360 - 180;

/** Bind deliberate mouse/pen rotation without taking over the console controls. */
export function bindConsoleDrag(element, {
  canStart = () => false,
  onPose = () => {},
  onDraggingChange = () => {},
} = {}, host = window) {
  const doc = host.document;
  let pose = { x: 0, y: 0 };
  let active = null;
  let pendingClick = null;
  let clickTimer = null;
  let disposed = false;

  function clearClickSuppression() {
    if (clickTimer !== null) host.clearTimeout(clickTimer);
    clickTimer = null;
    pendingClick = null;
  }

  function releaseCapture(pointerId) {
    try {
      if (!element.hasPointerCapture || element.hasPointerCapture(pointerId)) {
        element.releasePointerCapture?.(pointerId);
      }
    } catch {
      // Capture may already have been released by the browser or element removal.
    }
  }

  function finish({ suppressClick = true } = {}) {
    if (!active) return;
    const previous = active;
    active = null;
    releaseCapture(previous.id);
    if (previous.moved) {
      const wrapped = pose.y < -180 || pose.y > 180 ? wrapYaw(pose.y) : pose.y;
      if (wrapped !== pose.y) {
        pose = { x: pose.x, y: wrapped };
        onPose({ ...pose });
      }
    }
    if (previous.moved && suppressClick) {
      clearClickSuppression();
      pendingClick = { id: previous.id, type: previous.type };
      clickTimer = host.setTimeout(clearClickSuppression, CLICK_SUPPRESSION_MS);
    } else {
      clearClickSuppression();
    }
    onDraggingChange(false);
  }

  function updatePose(event) {
    if (!active || !Number.isFinite(event.clientX) || !Number.isFinite(event.clientY)) return;
    const dx = event.clientX - active.startX;
    const dy = event.clientY - active.startY;
    if (!active.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    active.moved = true;
    pendingClick = { id: active.id, type: active.type };
    const next = {
      x: clamp(active.origin.x + dy / active.width * 120, -55, 55),
      y: active.origin.y + dx / active.width * 180,
    };
    if (next.x !== pose.x || next.y !== pose.y) {
      pose = next;
      onPose({ ...pose });
    }
  }

  function onPointerDown(event) {
    if (disposed || active || event.isPrimary === false || event.button !== 0
      || !['mouse', 'pen'].includes(event.pointerType)
      || !Number.isFinite(event.clientX) || !Number.isFinite(event.clientY)) return;
    if (!canStart(event)) return;
    const width = Number(element.clientWidth);
    if (!Number.isFinite(width) || width <= 0) return;
    clearClickSuppression();
    active = {
      id: event.pointerId,
      type: event.pointerType,
      startX: event.clientX,
      startY: event.clientY,
      origin: { ...pose },
      width,
      moved: false,
    };
    event.preventDefault();
    try {
      element.setPointerCapture?.(event.pointerId);
    } catch {
      // Window listeners also finish drags when pointer capture is unavailable.
    }
    onDraggingChange(true);
  }

  function onPointerMove(event) {
    if (!active || event.pointerId !== active.id) return;
    if (event.buttons === 0) {
      finish();
      return;
    }
    event.preventDefault();
    updatePose(event);
  }

  function onPointerUp(event) {
    if (!active || event.pointerId !== active.id) return;
    updatePose(event);
    finish();
  }

  function onPointerCancel(event) {
    if (active && event.pointerId === active.id) finish({ suppressClick: false });
  }

  function onLostPointerCapture(event) {
    if (active && event.pointerId === active.id) finish();
  }

  function cancelGesture() {
    finish({ suppressClick: false });
    clearClickSuppression();
  }

  function onVisibilityChange() {
    if (doc.hidden) cancelGesture();
  }

  function onPointerLeave(event) {
    if (active && event.pointerId !== undefined && event.pointerId !== active.id) return;
    cancelGesture();
  }

  function onNewPointerDown() {
    // A later, intentional click must never be mistaken for the end of this drag.
    if (!active) clearClickSuppression();
  }

  function onClick(event) {
    if (!pendingClick || event.detail === 0
      || (event.pointerType && event.pointerType !== pendingClick.type)
      || (Number.isFinite(event.pointerId) && event.pointerId !== pendingClick.id)) return;
    clearClickSuppression();
    event.preventDefault();
    if (event.stopImmediatePropagation) event.stopImmediatePropagation();
    else event.stopPropagation?.();
  }

  element.addEventListener('pointerdown', onPointerDown);
  element.addEventListener('lostpointercapture', onLostPointerCapture);
  host.addEventListener('pointerdown', onNewPointerDown, true);
  host.addEventListener('pointermove', onPointerMove, { passive: false });
  host.addEventListener('pointerup', onPointerUp);
  host.addEventListener('pointercancel', onPointerCancel);
  host.addEventListener('click', onClick, true);
  host.addEventListener('blur', cancelGesture);
  doc.addEventListener('pointerleave', onPointerLeave);
  doc.addEventListener('visibilitychange', onVisibilityChange);

  return {
    reset() {
      if (disposed) return;
      cancelGesture();
      pose = { x: 0, y: 0 };
      onPose({ ...pose });
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelGesture();
      element.removeEventListener('pointerdown', onPointerDown);
      element.removeEventListener('lostpointercapture', onLostPointerCapture);
      host.removeEventListener('pointerdown', onNewPointerDown, true);
      host.removeEventListener('pointermove', onPointerMove);
      host.removeEventListener('pointerup', onPointerUp);
      host.removeEventListener('pointercancel', onPointerCancel);
      host.removeEventListener('click', onClick, true);
      host.removeEventListener('blur', cancelGesture);
      doc.removeEventListener('pointerleave', onPointerLeave);
      doc.removeEventListener('visibilitychange', onVisibilityChange);
    },
  };
}
