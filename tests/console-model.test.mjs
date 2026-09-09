import test from 'node:test';
import assert from 'node:assert/strict';
import { Box3, Vector3 } from 'three';
import {
  CONSOLE_WIDTH, CONSOLE_HEIGHT, createConsoleModel, updateConsoleModel, disposeConsoleModel,
} from '../src/three/createConsoleModel.js';

function close(actual, expected, label) {
  assert.ok(Math.abs(actual - expected) < 1e-8, `${label}: ${actual} should equal ${expected}`);
}

function withModel(run) {
  const model = createConsoleModel();
  try { run(model); } finally { disposeConsoleModel(model); }
}

test('the console is a finite solid object with separate shells, back details and raised controls', () => {
  withModel(model => {
    assert.equal(model.isGroup, true);
    assert.equal(model.userData.dimensions.width, CONSOLE_WIDTH);
    assert.equal(model.userData.dimensions.height, CONSOLE_HEIGHT);
    const bounds = new Box3().setFromObject(model);
    const size = bounds.getSize(new Vector3());
    assert.ok(Math.abs(size.x - CONSOLE_WIDTH) < CONSOLE_WIDTH * 0.05, 'case width remains registered to the DOM overlay');
    assert.ok(Math.abs(size.y - CONSOLE_HEIGHT) < CONSOLE_HEIGHT * 0.05, 'case height remains registered to the DOM overlay');
    assert.ok(size.z > 0.75 && size.z < 1, 'the object has real thickness, not a flat plane');
    assert.ok(bounds.min.z < -0.7, 'rear cover extends behind the front face');
    assert.ok(bounds.max.z > 0.1, 'physical buttons rise above the front plane');
    for (const name of ['Rear shell', 'Case seam', 'Rear battery cover', 'Headphone port', 'Cartridge slot', 'A button', 'B button']) {
      assert.equal(model.getObjectByName(name)?.isMesh, true, `${name} exists as real geometry`);
    }
    model.traverse(object => {
      if (!object.isMesh) return;
      assert.equal(object.geometry.isBufferGeometry, true);
      assert.equal(object.material.isMeshStandardMaterial, true);
      const positions = object.geometry.getAttribute('position');
      assert.ok(positions.count >= 3, `${object.name} has vertices`);
      assert.ok(positions.array.every(Number.isFinite), `${object.name} has finite geometry`);
    });
  });
});

test('the directional cross, arrows and center depress as one physical assembly', () => {
  withModel(model => {
    const pad = model.userData.controls.up;
    assert.equal(pad.isGroup, true);
    const details = ['Solid directional cross', 'Directional pad center', 'Engraved up arrow', 'Engraved right arrow', 'Engraved down arrow', 'Engraved left arrow']
      .map(name => {
        const object = pad.getObjectByName(name);
        assert.ok(object, `${name} belongs to the moving assembly`);
        return object;
      });
    model.updateMatrixWorld(true);
    const resting = details.map(object => object.getWorldPosition(new Vector3()));
    updateConsoleModel(model, { pressed: 'up' });
    model.updateMatrixWorld(true);
    details.forEach((object, index) => {
      const pressed = object.getWorldPosition(new Vector3());
      close(pressed.x, resting[index].x, 'press preserves horizontal registration');
      close(pressed.y, resting[index].y, 'press preserves vertical registration');
      close(pressed.z, resting[index].z - 0.032, 'all pad details travel together');
    });
  });
});

test('speaker and display apertures are real holes in extruded geometry', () => {
  withModel(model => {
    const shell = model.getObjectByName('Front shell with six recessed speaker openings');
    const bezel = model.getObjectByName('Recessed display bezel');
    assert.equal(shell.geometry.type, 'ExtrudeGeometry');
    assert.equal(shell.geometry.parameters.shapes.holes.length, 6);
    assert.ok(shell.geometry.parameters.options.depth > 0.2);
    assert.equal(bezel.geometry.type, 'ExtrudeGeometry');
    assert.equal(bezel.geometry.parameters.shapes.holes.length, 1);
    for (let index = 1; index <= 6; index += 1) {
      const floor = model.getObjectByName(`Speaker cavity ${index}`);
      assert.ok(floor.position.z < shell.position.z + shell.geometry.parameters.options.depth, 'speaker cavity lies behind the shell face');
    }
    model.updateMatrixWorld(true);
    const glassBounds = new Box3().setFromObject(model.userData.lcd);
    assert.ok(Math.abs(glassBounds.max.z) < 1e-6, 'glass front matches the shared HTML Z=0 registration plane');
  });
});

test('press feedback resets all controls and never accumulates button travel', () => {
  withModel(model => {
    const { controls } = model.userData;
    assert.deepEqual(Object.keys(controls).sort(), ['a', 'b', 'down', 'left', 'right', 'select', 'start', 'up']);
    const uniqueControls = new Set(Object.values(controls));
    assert.equal(uniqueControls.size, 5, 'four directional inputs operate one physical cross');
    for (const direction of ['up', 'down', 'left', 'right']) assert.equal(controls[direction], controls.up);
    for (const pressed of Object.keys(controls)) {
      for (let repeat = 0; repeat < 3; repeat += 1) {
        updateConsoleModel(model, { pressed });
        for (const control of uniqueControls) {
          const expected = control.userData.restZ - (control === controls[pressed] ? 0.032 : 0);
          close(control.position.z, expected, `${pressed} press restores independent controls`);
        }
      }
    }
    for (const state of [{ pressed: 'unknown' }, {}]) {
      updateConsoleModel(model, state);
      for (const control of uniqueControls) close(control.position.z, control.userData.restZ, 'released control');
    }
  });
});

test('power state synchronizes the LED, LCD backing and physical switch and can be restored', () => {
  withModel(model => {
    const { led, lcd, switchGroup } = model.userData;
    updateConsoleModel(model, { powered: false, pressed: 'a' });
    assert.equal(led.material.emissiveIntensity, 0);
    assert.equal(led.material.color.getHexString(), '5c5144');
    assert.equal(lcd.material.color.getHexString(), '919e6b');
    close(switchGroup.position.x, -1.46, 'switch off position');
    updateConsoleModel(model);
    assert.equal(led.material.emissiveIntensity, 0.6);
    assert.equal(led.material.color.getHexString(), 'df7150');
    assert.equal(lcd.material.color.getHexString(), '9faf70');
    close(switchGroup.position.x, -1.38, 'switch on position');
    close(model.userData.controls.a.position.z, model.userData.controls.a.userData.restZ, 'default update releases the control');
  });
});

test('model instances own their resources and dispose shared materials exactly once', () => {
  const first = createConsoleModel();
  const second = createConsoleModel();
  const collect = model => {
    const resources = new Set();
    model.traverse(object => {
      if (object.geometry) resources.add(object.geometry);
      if (object.material) (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => resources.add(material));
    });
    return resources;
  };
  const firstResources = collect(first), secondResources = collect(second);
  const counts = new Map();
  for (const resource of [...firstResources, ...secondResources]) {
    counts.set(resource, 0);
    resource.addEventListener('dispose', () => counts.set(resource, counts.get(resource) + 1));
  }
  assert.ok([...firstResources].every(resource => !secondResources.has(resource)), 'Strict Mode remounts receive independent resources');
  updateConsoleModel(first, { powered: false, pressed: 'b' });
  assert.equal(second.userData.led.material.emissiveIntensity, 0.6, 'one instance cannot mutate another');
  disposeConsoleModel(first);
  for (const resource of firstResources) assert.equal(counts.get(resource), 1, 'each resource is disposed only once per model teardown');
  for (const resource of secondResources) assert.equal(counts.get(resource), 0, 'other mounted instances remain usable');
  disposeConsoleModel(second);
  for (const resource of secondResources) assert.equal(counts.get(resource), 1);
});
