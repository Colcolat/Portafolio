import test from 'node:test';
import assert from 'node:assert/strict';
import { Box3, Euler, Group, MathUtils, PerspectiveCamera, Raycaster, Vector2, Vector3 } from 'three';
import {
  PROTECTED_CONSOLE_TARGETS, createConsoleHitTest, isConsoleFrontVisible, isDraggableConsoleHit,
} from '../src/three/consoleHitTest.js';
import { createConsoleModel, disposeConsoleModel } from '../src/three/createConsoleModel.js';
import { CAMERA_DISTANCE, consoleRotation, cssProjectionMatrix, projectionDimensions } from '../src/three/consoleProjection.js';

function close(actual, expected, label) {
  assert.ok(Math.abs(actual - expected) < 1e-8, `${label}: ${actual} should equal ${expected}`);
}

function fixture(run, rotation = new Euler()) {
  const model = createConsoleModel();
  model.rotation.copy(rotation);
  model.updateMatrixWorld(true);
  const dimensions = projectionDimensions(414, 658);
  const camera = new PerspectiveCamera(dimensions.fov, dimensions.aspect, 0.1, 50);
  camera.position.z = CAMERA_DISTANCE;
  camera.updateMatrixWorld();
  const rect = { left: 73, top: 119, width: dimensions.canvasWidth, height: dimensions.canvasHeight };
  const canvas = { getBoundingClientRect: () => rect };
  const hitTest = createConsoleHitTest(model, camera, canvas);
  const raycaster = new Raycaster();
  const eventAtWorld = point => {
    const ndc = point.clone().project(camera);
    return {
      clientX: rect.left + (ndc.x + 1) * rect.width / 2,
      clientY: rect.top + (1 - ndc.y) * rect.height / 2,
      target: { closest: () => null },
    };
  };
  const eventAtLocal = (x, y, z = 0) => eventAtWorld(model.localToWorld(new Vector3(x, y, z)));
  const hitAt = event => {
    model.updateWorldMatrix(true, true);
    raycaster.setFromCamera(new Vector2((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1), camera);
    return raycaster.intersectObject(model, true)[0];
  };
  const eventAtMesh = name => {
    const mesh = model.getObjectByName(name);
    assert.ok(mesh, `${name} exists`);
    return eventAtWorld(new Box3().setFromObject(mesh).getCenter(new Vector3()));
  };
  try { run({ model, camera, rect, hitTest, hitAt, eventAtLocal, eventAtWorld, eventAtMesh }); }
  finally { disposeConsoleModel(model); }
}

test('actual rays allow dragging blank front and bottom casing in straight and resting views', () => {
  for (const rotation of [new Euler(), consoleRotation()]) {
    fixture(({ hitTest, hitAt, eventAtLocal }) => {
      for (const [x, y] of [[0, -0.65], [0, -3.05], [-1.65, -2.87], [1, 2.96]]) {
        const event = eventAtLocal(x, y, -0.035);
        assert.match(hitAt(event)?.object.name ?? '', /shell|panel join/i, 'the test ray really reaches the casing');
        assert.equal(hitTest(event), true, 'unprotected casing starts a drag');
      }
    }, rotation);
  }
});

test('blank canvas, out-of-canvas pointers and zero-sized canvas cannot start a drag', () => {
  fixture(({ hitTest, hitAt, rect }) => {
    const event = { clientX: rect.left + 2, clientY: rect.top + 2, target: { closest: () => null } };
    assert.equal(hitAt(event), undefined, 'padded canvas corner contains no geometry');
    assert.equal(hitTest(event), false);
    for (const [x, y] of [[rect.left - 1, rect.top + rect.height / 2], [rect.left + rect.width + 1, rect.top + rect.height / 2],
      [rect.left + rect.width / 2, rect.top - 1], [rect.left + rect.width / 2, rect.top + rect.height + 1]]) {
      assert.equal(hitTest({ ...event, clientX: x, clientY: y }), false);
    }
    rect.width = 0;
    assert.equal(hitTest(event), false);
    rect.width = 100; rect.height = 0;
    assert.equal(hitTest(event), false);
  });
});

test('real rays protect LCD, bezel, raised power slider, directional pad and every action/system button', () => {
  fixture(({ hitTest, hitAt, eventAtMesh, eventAtLocal }) => {
    const meshNames = ['LCD glass backing', 'Power indicator', 'Directional pad center', 'Engraved up arrow',
      'Engraved right arrow', 'Engraved down arrow', 'Engraved left arrow', 'A button', 'B button', 'select button', 'start button'];
    for (const name of meshNames) {
      const event = eventAtMesh(name);
      assert.ok(hitAt(event), `${name} test ray intersects a real mesh`);
      assert.equal(hitTest(event), false, `${name} must retain its normal interaction`);
    }
    const bezelEvent = eventAtLocal(-1.65, 2.24, 0.025);
    assert.equal(hitAt(bezelEvent)?.object.name, 'Recessed display bezel');
    assert.equal(hitTest(bezelEvent), false);
    // Aim above the front shell's top edge, on the visible raised slider grip.
    const powerEvent = eventAtLocal(-1.38, 3.31, -0.09);
    assert.match(hitAt(powerEvent)?.object.name ?? '', /Power grip|Power slider/);
    assert.equal(hitTest(powerEvent), false);
  });
});

test('protected DOM descendants reject a drag even if the ray would hit plain casing', () => {
  fixture(({ hitTest, eventAtLocal }) => {
    const event = eventAtLocal(0, -0.65, -0.035);
    assert.equal(hitTest(event), true);
    let selector;
    event.target = { closest: query => { selector = query; return { tagName: 'BUTTON' }; } };
    assert.equal(hitTest(event), false);
    assert.equal(selector, PROTECTED_CONSOLE_TARGETS);
    for (const required of ['button', 'a', 'input', 'select', 'textarea', '[role="button"]', '.screen-bezel', '.dpad-well', '.action-buttons', '.system-buttons', '.power-switch']) {
      assert.ok(PROTECTED_CONSOLE_TARGETS.split(', ').includes(required), `${required} is protected`);
    }
  });
});

test('drag blocking traverses all mesh ancestors and cannot miss protected assemblies', () => {
  assert.equal(isDraggableConsoleHit(undefined), false);
  const root = new Group(), parent = new Group(), mesh = new Group();
  root.add(parent); parent.add(mesh);
  assert.equal(isDraggableConsoleHit({ object: mesh }), true);
  for (const object of [mesh, parent, root]) {
    object.userData.dragBlocked = true;
    assert.equal(isDraggableConsoleHit({ object: mesh }), false);
    delete object.userData.dragBlocked;
  }
  fixture(({ model }) => {
    for (const name of ['A button', 'B button', 'Power grip 0', 'Engraved up arrow']) {
      const mesh = model.getObjectByName(name);
      assert.ok(mesh);
      assert.equal(mesh.userData.dragBlocked, undefined, 'these child meshes rely on their assembly tag');
      assert.equal(isDraggableConsoleHit({ object: mesh }), false, `${name} inherits drag protection`);
    }
  });
});

test('the rear shell and rear battery cover remain draggable after a half-turn', () => {
  fixture(({ hitTest, hitAt, eventAtLocal }) => {
    for (const [x, y] of [[0, 1.5], [0, -1.5]]) {
      const event = eventAtLocal(x, y, -0.8);
      assert.match(hitAt(event)?.object.name ?? '', /Rear shell|Rear battery cover/);
      assert.equal(hitTest(event), true, 'front controls must not block a nearer rear-shell intersection');
    }
  }, new Euler(0, Math.PI, 0));
});

test('front visibility hides rear and edge-on DOM while allowing readable front views', () => {
  for (const rotation of [new Euler(), consoleRotation(), consoleRotation(0, 0, 20, 30), new Euler(0, 2 * Math.PI, 0)]) {
    assert.equal(isConsoleFrontVisible(rotation), true);
  }
  for (const rotation of [new Euler(0, Math.PI, 0), new Euler(0, Math.PI / 2, 0), new Euler(0, -Math.PI / 2, 0),
    new Euler(Math.PI / 2, 0, 0), new Euler(0, Math.acos(0.079), 0)]) {
    assert.equal(isConsoleFrontVisible(rotation), false);
  }
  assert.equal(isConsoleFrontVisible(new Euler(0, Math.acos(0.081), 0)), true, 'front remains available above the visibility threshold');
});

test('manual pitch/yaw combine with pointer tilt without wrapping away complete rotations', () => {
  const neutral = consoleRotation();
  for (const [tiltX, tiltY, dragX, dragY] of [[0, 0, 55, 180], [3, -5, -55, -360], [-3, 5, 25.3, 765]]) {
    const rotation = consoleRotation(tiltX, tiltY, dragX, dragY);
    close(MathUtils.radToDeg(rotation.x - neutral.x), dragX - tiltX, 'combined pitch');
    close(MathUtils.radToDeg(rotation.y - neutral.y), dragY + tiltY, 'combined yaw');
    close(rotation.z, neutral.z, 'editorial roll');
  }
});

test('CSS and Three projections remain identical through manual front, side, rear and multi-turn poses', () => {
  const poses = [consoleRotation(0, 0, 55, 32), consoleRotation(-3, 5, -55, 112),
    consoleRotation(0, 0, 0, 202), consoleRotation(3, -5, 30, -338), consoleRotation(0, 0, -17.3, 765)];
  for (const width of [256, 326, 414, 500]) {
    const dimensions = projectionDimensions(width, width * 6.58 / 4.14);
    const camera = new PerspectiveCamera(dimensions.fov, dimensions.aspect, 0.1, 50);
    camera.position.z = CAMERA_DISTANCE; camera.updateMatrixWorld();
    for (const rotation of poses) {
      const matrix = cssProjectionMatrix(rotation, dimensions.pixelsPerUnit).slice(9, -1).split(',').map(Number);
      for (const [x, y] of [[0, 0], [-2.07, -3.29], [2.07, 3.29], [-1.22, 2.15], [1.507, -0.197]]) {
        const point = [x * dimensions.pixelsPerUnit, -y * dimensions.pixelsPerUnit, 0, 1];
        const transformed = [0, 1, 2, 3].map(row => point.reduce((sum, value, column) => sum + matrix[column * 4 + row] * value, 0));
        const perspectiveW = transformed[3] - transformed[2] / dimensions.perspective;
        const ndc = new Vector3(x, y, 0).applyEuler(rotation).project(camera);
        close(transformed[0] / perspectiveW, ndc.x * dimensions.canvasWidth / 2, 'manual horizontal registration');
        close(transformed[1] / perspectiveW, -ndc.y * dimensions.canvasHeight / 2, 'manual vertical registration');
      }
    }
  }
});
