import { Euler, MathUtils, Matrix4 } from 'three';

export const CAMERA_DISTANCE = 14;
export const CANVAS_PADDING = { x: 0.18, y: 0.12 };

export function consoleRotation(tiltX = 0, tiltY = 0, dragX = 0, dragY = 0) {
  return new Euler(
    MathUtils.degToRad(8 - tiltX + dragX),
    MathUtils.degToRad(-22 + tiltY + dragY),
    MathUtils.degToRad(5),
    'XYZ',
  );
}

// Three uses upward Y; DOM surfaces use downward Y. S * R * S converts
// between them without approximating the live screen with a bounding box.
export function cssProjectionMatrix(rotation, pixelsPerUnit) {
  const matrix = new Matrix4().makeRotationFromEuler(rotation);
  const flip = [1, -1, 1, 1];
  const values = matrix.elements.map((value, index) => {
    const row = index % 4, column = Math.floor(index / 4);
    return value * flip[row] * flip[column] * (column === 3 && row < 3 ? pixelsPerUnit : 1);
  });
  return `matrix3d(${values.map(value => Math.abs(value) < 1e-12 ? 0 : value).join(',')})`;
}

export function projectionDimensions(width, height) {
  const pixelsPerUnit = width / 4.14;
  const canvasWidth = width * (1 + 2 * CANVAS_PADDING.x);
  const canvasHeight = height * (1 + 2 * CANVAS_PADDING.y);
  return {
    pixelsPerUnit, canvasWidth, canvasHeight,
    perspective: CAMERA_DISTANCE * pixelsPerUnit,
    aspect: canvasWidth / canvasHeight,
    fov: MathUtils.radToDeg(2 * Math.atan(canvasHeight / pixelsPerUnit / (2 * CAMERA_DISTANCE))),
  };
}
