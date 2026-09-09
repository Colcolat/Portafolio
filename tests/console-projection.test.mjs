import test from 'node:test';
import assert from 'node:assert/strict';
import { Euler, MathUtils, PerspectiveCamera, Vector3 } from 'three';
import {
  CAMERA_DISTANCE, CANVAS_PADDING, consoleRotation, cssProjectionMatrix, projectionDimensions,
} from '../src/three/consoleProjection.js';

function close(actual, expected, label, tolerance = 1e-8) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${label}: ${actual} should equal ${expected}`);
}

function cssPoint(matrixText, [x, y, z], perspective) {
  assert.match(matrixText, /^matrix3d\([^()]+\)$/);
  const matrix = matrixText.slice(9, -1).split(',').map(Number);
  assert.equal(matrix.length, 16);
  assert.ok(matrix.every(Number.isFinite));
  const point = [x, y, z, 1];
  const transformed = [0, 1, 2, 3].map(row => point.reduce((sum, value, column) => sum + value * matrix[column * 4 + row], 0));
  const w = transformed[3] - transformed[2] / perspective;
  return { x: transformed[0] / w, y: transformed[1] / w };
}

test('neutral and pointer-driven poses retain the intended real-console orientation', () => {
  const neutral = consoleRotation();
  assert.ok(neutral.x > 0 && neutral.x < Math.PI / 4, 'neutral pitch reveals the case depth');
  assert.ok(neutral.y < 0 && neutral.y > -Math.PI / 4, 'neutral yaw reveals the right sidewall');
  assert.ok(neutral.z > 0 && neutral.z < Math.PI / 8, 'editorial roll remains subtle');
  for (const [x, y] of [[0, 0], [3, -5], [-3, 5]]) {
    const rotation = consoleRotation(x, y);
    close(MathUtils.radToDeg(rotation.x - neutral.x), -x, 'X input follows DOM-to-Three axis conversion');
    close(MathUtils.radToDeg(rotation.y - neutral.y), y, 'Y input follows pointer movement');
    close(rotation.z, neutral.z, 'pointer movement does not change editorial roll');
    assert.equal(rotation.order, 'XYZ');
  }
});

test('the padded viewport, perspective distance and FOV preserve physical scale', () => {
  for (const width of [248, 318, 382, 414, 500, 534.5]) {
    const height = width * 6.58 / 4.14;
    const dimensions = projectionDimensions(width, height);
    close(dimensions.pixelsPerUnit, width / 4.14, 'pixels per physical unit');
    close(dimensions.canvasWidth, width * (1 + 2 * CANVAS_PADDING.x), 'padded canvas width');
    close(dimensions.canvasHeight, height * (1 + 2 * CANVAS_PADDING.y), 'padded canvas height');
    close(dimensions.aspect, dimensions.canvasWidth / dimensions.canvasHeight, 'canvas aspect');
    close(dimensions.perspective, CAMERA_DISTANCE * dimensions.pixelsPerUnit, 'CSS perspective');
    const visiblePhysicalHeight = 2 * CAMERA_DISTANCE * Math.tan(MathUtils.degToRad(dimensions.fov) / 2);
    close(visiblePhysicalHeight * dimensions.pixelsPerUnit, dimensions.canvasHeight, 'FOV-derived viewport height');
  }
});

test('CSS matrix and Three camera project the front plane identically across responsive sizes and poses', () => {
  const poses = [new Euler(0, 0, 0), consoleRotation(), consoleRotation(3, -5), consoleRotation(-3, 5), consoleRotation(1.35, 2.47)];
  const sizes = [[248, 394.16], [318, 505.42], [382, 607.14], [414, 658], [500, 794.69], [534.5, 843.25]];
  // Case edges, live-screen corners and its center all lie on the shared Z=0 plane.
  const points = [[0, 0], [-2.07, -3.29], [2.07, 3.29], [-2.07, 3.29], [2.07, -3.29],
    [0.142 - 1.365, 0.978 - 1.175], [0.142 + 1.365, 0.978 + 1.175],
    [0.142 - 1.365, 0.978 + 1.175], [0.142 + 1.365, 0.978 - 1.175], [0.142, 0.978]];
  for (const [width, height] of sizes) {
    const dimensions = projectionDimensions(width, height);
    const camera = new PerspectiveCamera(dimensions.fov, dimensions.aspect, 0.1, 50);
    camera.position.z = CAMERA_DISTANCE;
    camera.updateMatrixWorld();
    for (const rotation of poses) {
      const cssMatrix = cssProjectionMatrix(rotation, dimensions.pixelsPerUnit);
      for (const [x, y] of points) {
        const ndc = new Vector3(x, y, 0).applyEuler(rotation).project(camera);
        const screen = cssPoint(cssMatrix, [x * dimensions.pixelsPerUnit, -y * dimensions.pixelsPerUnit, 0], dimensions.perspective);
        // Both children share the host center; canvas padding cancels when mapped back into host coordinates.
        const webglX = (ndc.x + 1) * dimensions.canvasWidth / 2 - (dimensions.canvasWidth - width) / 2;
        const webglY = (1 - ndc.y) * dimensions.canvasHeight / 2 - (dimensions.canvasHeight - height) / 2;
        close(screen.x + width / 2, webglX, `horizontal registration at ${width}px`);
        close(screen.y + height / 2, webglY, `vertical registration at ${width}px`);
      }
    }
  }
});

test('the CSS coordinate conversion also preserves depth, not only a planar rotation', () => {
  const dimensions = projectionDimensions(414, 658);
  const rotation = consoleRotation(-2.3, 4.6);
  const matrix = cssProjectionMatrix(rotation, dimensions.pixelsPerUnit);
  for (const [x, y, z] of [[1, 2, -0.75], [-0.8, -1, 0.12], [0, 0, -0.4]]) {
    const world = new Vector3(x, y, z).applyEuler(rotation);
    const scale = CAMERA_DISTANCE / (CAMERA_DISTANCE - world.z);
    const actual = cssPoint(matrix, [x * dimensions.pixelsPerUnit, -y * dimensions.pixelsPerUnit, z * dimensions.pixelsPerUnit], dimensions.perspective);
    close(actual.x, world.x * scale * dimensions.pixelsPerUnit, 'depth-correct horizontal position');
    close(actual.y, -world.y * scale * dimensions.pixelsPerUnit, 'depth-correct vertical position');
  }
});
