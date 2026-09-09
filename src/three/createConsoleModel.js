import * as THREE from 'three';

export const CONSOLE_WIDTH = 4.14;
export const CONSOLE_HEIGHT = 6.58;

function roundedShape(width, height, radii = 0.1) {
  const [tl, tr, br, bl] = Array.isArray(radii) ? radii : [radii, radii, radii, radii];
  const x = -width / 2, y = -height / 2;
  const shape = new THREE.Shape();
  shape.moveTo(x + bl, y);
  shape.lineTo(x + width - br, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + br);
  shape.lineTo(x + width, y + height - tr);
  shape.quadraticCurveTo(x + width, y + height, x + width - tr, y + height);
  shape.lineTo(x + tl, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - tl);
  shape.lineTo(x, y + bl);
  shape.quadraticCurveTo(x, y, x + bl, y);
  return shape;
}

function holeFrom(shape, x = 0, y = 0, angle = 0) {
  const path = new THREE.Path();
  const c = Math.cos(angle), s = Math.sin(angle);
  shape.getPoints(12).forEach((point, index) => {
    const px = point.x * c - point.y * s + x;
    const py = point.x * s + point.y * c + y;
    if (index === 0) path.moveTo(px, py); else path.lineTo(px, py);
  });
  path.closePath();
  return path;
}

export function createConsoleModel() {
  const group = new THREE.Group();
  group.name = 'Pocket portfolio — solid handheld';
  const material = (color, roughness = 0.68, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const ivory = material('#dce1cc');
  const rearIvory = material('#c3cbb3');
  const seamMaterial = material('#7d8a70');
  const bezelMaterial = material('#656f60', 0.74);
  const graphite = material('#293329', 0.57);
  const cavity = material('#182419', 0.9);
  const wellMaterial = material('#b9c4a7');
  const magenta = material('#8d3555', 0.42);
  const pillMaterial = material('#8e9c7c', 0.55);
  const lcdMaterial = material('#9faf70', 0.9);
  const metal = material('#82917a', 0.4, 0.35);
  const controls = {};
  const mesh = (name, geometry, mat, x = 0, y = 0, z = 0, parent = group) => {
    const object = new THREE.Mesh(geometry, mat);
    object.name = name; object.position.set(x, y, z);
    object.castShadow = true; object.receiveShadow = true;
    parent.add(object); return object;
  };
  const extrude = (name, shape, depth, mat, x = 0, y = 0, front = 0, bevel = 0.018, parent = group) => {
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth, steps: 1, bevelEnabled: bevel > 0, bevelSegments: 3,
      bevelThickness: bevel, bevelSize: bevel, curveSegments: 12,
    });
    return mesh(name, geometry, mat, x, y, front - depth - bevel, parent);
  };
  const roundSolid = (name, width, height, radius, depth, mat, x, y, front, bevel = 0.018, parent = group) =>
    extrude(name, roundedShape(width, height, radius), depth, mat, x, y, front, bevel, parent);
  const disc = (name, radius, depth, mat, x, y, front, parent = group) => {
    const object = mesh(name, new THREE.CylinderGeometry(radius, radius, depth, 48), mat, x, y, front - depth / 2, parent);
    object.rotation.x = Math.PI / 2; return object;
  };

  // Separate front and back shells leave a visible seam around real sidewalls.
  const shellShape = roundedShape(4.09, 6.53, [0.19, 0.19, 0.70, 0.22]);
  const speakerCenter = new THREE.Vector2(1.43658, -2.5189);
  const speakerAngle = THREE.MathUtils.degToRad(31);
  for (let i = 0; i < 6; i += 1) {
    const dx = (i - 2.5) * 0.13455;
    const x = speakerCenter.x + Math.cos(speakerAngle) * dx;
    const y = speakerCenter.y + Math.sin(speakerAngle) * dx;
    const slotHeight = i === 0 || i === 5 ? 0.4968 : 0.621;
    shellShape.holes.push(holeFrom(roundedShape(0.082, slotHeight, 0.04), x, y, speakerAngle));
    const floor = roundSolid(`Speaker cavity ${i + 1}`, 0.14, slotHeight + 0.05, 0.038, 0.012, cavity, x, y, -0.14, 0.005);
    floor.rotation.z = speakerAngle;
  }
  extrude('Front shell with six recessed speaker openings', shellShape, 0.27, ivory, 0, 0, -0.035, 0.018);
  roundSolid('Case seam', 4.035, 6.475, [0.19, 0.19, 0.69, 0.22], 0.025, seamMaterial, 0, 0, -0.345, 0.025);
  roundSolid('Rear shell', 4.025, 6.465, [0.19, 0.19, 0.68, 0.22], 0.28, rearIvory, 0, 0, -0.385, 0.04);
  const panelJoin = roundSolid('Upper panel join', 4.035, 0.009, 0.004, 0.006, wellMaterial, 0, 2.81, -0.025, 0.002);
  panelJoin.castShadow = false; panelJoin.receiveShadow = false;

  const bezelShape = roundedShape(3.60, 2.955, [0.13, 0.13, 0.39, 0.13]);
  // The hole is geometry, not a painted rectangle. Its lip surrounds the live HTML display.
  bezelShape.holes.push(holeFrom(roundedShape(2.80, 2.425, 0.025), 0.142, -0.075));
  extrude('Recessed display bezel', bezelShape, 0.08, bezelMaterial, 0, 1.053, 0.025, 0.018);
  roundSolid('LCD recessed bed', 2.81, 2.43, 0.02, 0.015, graphite, 0.142, 0.978, -0.005, 0.006);
  const lcd = roundSolid('LCD glass backing', 2.73, 2.35, 0.012, 0.005, lcdMaterial, 0.142, 0.978, 0, 0.003);

  // Power LED and a ribbed physical power slider protrude above the case edge.
  const ledMaterial = new THREE.MeshStandardMaterial({ color: '#df7150', emissive: '#b82e0d', emissiveIntensity: 0.6, roughness: 0.38 });
  const led = disc('Power indicator', 0.0393, 0.025, ledMaterial, -1.641, 1.31, 0.048);
  const switchGroup = new THREE.Group(); switchGroup.name = 'Ribbed power switch';
  switchGroup.position.set(-1.38, 3.275, -0.10); group.add(switchGroup);
  roundSolid('Power slider', 0.30, 0.105, 0.025, 0.25, graphite, 0, 0, 0, 0.01, switchGroup);
  for (let i = 0; i < 7; i += 1) roundSolid(`Power grip ${i}`, 0.013, 0.10, 0.005, 0.012, metal, -0.126 + i * 0.042, 0, 0.018, 0.002, switchGroup);
  for (let i = 0; i < 5; i += 1) roundSolid(`Side grip ${i}`, 0.06, 0.046, 0.009, 0.18, seamMaterial, -2.072, 1.7 - i * 0.065, -0.10, 0.005);

  disc('Directional pad recess', 0.652, 0.022, wellMaterial, -1.066, -1.864, -0.008);
  const half = 0.578, arm = 0.19;
  const cross = new THREE.Shape();
  [[-arm, half], [arm, half], [arm, arm], [half, arm], [half, -arm], [arm, -arm], [arm, -half], [-arm, -half], [-arm, -arm], [-half, -arm], [-half, arm], [-arm, arm]].forEach(([x, y], i) => i ? cross.lineTo(x, y) : cross.moveTo(x, y));
  cross.closePath();
  const dpad = new THREE.Group(); dpad.name = 'Directional pad assembly'; group.add(dpad);
  extrude('Solid directional cross', cross, 0.105, graphite, -1.066, -1.864, 0.11, 0.025, dpad);
  const center = disc('Directional pad center', 0.123, 0.012, cavity, -1.066, -1.864, 0.115, dpad);
  ['up', 'right', 'down', 'left'].forEach((direction, i) => {
    const arrow = new THREE.Shape(); arrow.moveTo(0, 0.055); arrow.lineTo(-0.044, -0.028); arrow.lineTo(0.044, -0.028); arrow.closePath();
    const angle = -i * Math.PI / 2;
    const x = -1.066 - Math.sin(angle) * 0.42, y = -1.864 + Math.cos(angle) * 0.42;
    const object = mesh(`Engraved ${direction} arrow`, new THREE.ShapeGeometry(arrow), cavity, x, y, 0.112, dpad);
    object.rotation.z = angle; controls[direction] = dpad;
  });

  const actions = new THREE.Group(); actions.position.set(1.00395, -1.59633, 0); actions.rotation.z = THREE.MathUtils.degToRad(28); group.add(actions);
  roundSolid('Action button inset', 1.47, 0.665, 0.31, 0.025, wellMaterial, 0, 0, -0.01, 0.02, actions);
  for (const [name, x] of [['b', -0.38295], ['a', 0.38295]]) {
    disc(`${name.toUpperCase()} socket`, 0.324, 0.025, seamMaterial, x, -0.03105, 0.01, actions);
    const profile = [[0, -0.057], [0.28, -0.057], [0.307, -0.035], [0.307, 0.033], [0.291, 0.057], [0, 0.057]].map(([r, h]) => new THREE.Vector2(r, h));
    const button = mesh(`${name.toUpperCase()} button`, new THREE.LatheGeometry(profile, 48), magenta, x, -0.03105, 0.06, actions);
    button.rotation.x = Math.PI / 2; controls[name] = button;
  }
  for (const [name, x, y] of [['select', -0.5584, -2.758], ['start', -0.0614, -2.494]]) {
    const socket = roundSolid(`${name} socket`, 0.443, 0.163, 0.077, 0.014, seamMaterial, x, y, -0.008, 0.008); socket.rotation.z = THREE.MathUtils.degToRad(28);
    const button = roundSolid(`${name} button`, 0.397, 0.116, 0.057, 0.071, pillMaterial, x, y, 0.056, 0.012); button.rotation.z = THREE.MathUtils.degToRad(28); controls[name] = button;
  }

  // Back and top details make this a complete object, not a front-facing card.
  roundSolid('Rear battery cover seam', 2.82, 2.45, 0.16, 0.018, seamMaterial, 0, -1.50, -0.730, 0.008);
  roundSolid('Rear battery cover', 2.77, 2.40, 0.145, 0.025, rearIvory, 0, -1.50, -0.741, 0.006);
  for (const [x, y] of [[-1.72, 2.86], [1.72, 2.86], [-1.72, -2.84], [1.57, -2.72]]) {
    const screw = disc('Rear screw', 0.053, 0.014, metal, x, y, -0.748);
    const groove = mesh('Screw slot', new THREE.BoxGeometry(0.065, 0.012, 0.006), cavity, x, y, screw.position.z - 0.012);
    groove.rotation.z = 0.35;
  }
  const jack = mesh('Headphone port', new THREE.CylinderGeometry(0.067, 0.067, 0.018, 24), cavity, 0.06, -3.299, -0.40);
  jack.rotation.x = 0;
  roundSolid('Cartridge slot', 2.24, 0.048, 0.02, 0.14, cavity, 0, 3.288, -0.43, 0.003);

  // Physical controls remain protected even when their raised geometry extends
  // past the HTML hit area at an oblique viewing angle.
  const protectedParts = [
    'Recessed display bezel', 'LCD recessed bed', 'LCD glass backing', 'Power indicator',
    'Ribbed power switch', 'Directional pad recess', 'Directional pad assembly',
    'select socket', 'select button', 'start socket', 'start button',
  ];
  for (const name of protectedParts) group.getObjectByName(name).userData.dragBlocked = true;
  actions.userData.dragBlocked = true;

  for (const object of new Set(Object.values(controls))) object.userData.restZ = object.position.z;
  group.userData = { controls, led, lcd, switchGroup, center, dimensions: { width: CONSOLE_WIDTH, height: CONSOLE_HEIGHT, depth: 0.75 } };
  return group;
}

export function updateConsoleModel(group, { powered = true, pressed = '' } = {}) {
  const { controls, led, lcd, switchGroup } = group.userData;
  for (const object of new Set(Object.values(controls))) object.position.z = object.userData.restZ;
  if (controls[pressed]) controls[pressed].position.z -= 0.032;
  led.material.emissiveIntensity = powered ? 0.6 : 0;
  led.material.color.set(powered ? '#df7150' : '#5c5144');
  lcd.material.color.set(powered ? '#9faf70' : '#919e6b');
  switchGroup.position.x = powered ? -1.38 : -1.46;
}

export function disposeConsoleModel(group) {
  const geometries = new Set(), materials = new Set();
  group.traverse(object => {
    if (object.geometry) geometries.add(object.geometry);
    if (object.material) (Array.isArray(object.material) ? object.material : [object.material]).forEach(mat => materials.add(mat));
  });
  geometries.forEach(geometry => geometry.dispose());
  materials.forEach(mat => mat.dispose());
}
