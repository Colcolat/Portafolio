import { Raycaster, Vector2, Vector3 } from 'three';

export const PROTECTED_CONSOLE_TARGETS = 'button, a, input, select, textarea, [role="button"], .screen-bezel, .dpad-well, .action-buttons, .system-buttons, .power-switch';

export function isDraggableConsoleHit(hit) {
  if (!hit) return false;
  for (let object = hit.object; object; object = object.parent) {
    if (object.userData.dragBlocked) return false;
  }
  return true;
}

export function createConsoleHitTest(model, camera, canvas) {
  const raycaster = new Raycaster();
  const pointer = new Vector2();
  return event => {
    if (event.target?.closest?.(PROTECTED_CONSOLE_TARGETS)) return false;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return false;
    pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    if (Math.abs(pointer.x) > 1 || Math.abs(pointer.y) > 1) return false;
    model.updateWorldMatrix(true, true);
    camera.updateMatrixWorld();
    raycaster.setFromCamera(pointer, camera);
    return isDraggableConsoleHit(raycaster.intersectObject(model, true)[0]);
  };
}

export function isConsoleFrontVisible(rotation) {
  // Hide the HTML surface near edge-on and from behind: no mirrored screen or
  // invisible focusable buttons floating over the rear shell.
  return new Vector3(0, 0, 1).applyEuler(rotation).z > 0.08;
}

export function isConsoleRearVisible(rotation) {
  // Use the same edge-on dead zone so neither side exposes invisible controls.
  return new Vector3(0, 0, 1).applyEuler(rotation).z < -0.08;
}
