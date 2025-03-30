import * as THREE from 'three';

// Utility function to create a basic material with optional color
// Moved from GameAssets.js
function createMaterial(color = 0x44aaff, isEmissive = false) {
  const material = new THREE.MeshStandardMaterial({
    color: color,
    flatShading: true,
    roughness: 0.8,
    metalness: 0.2
  });

  if (isEmissive) {
    material.emissive = new THREE.Color(color);
    material.emissiveIntensity = 0.5;
  }

  return material;
}

// --- Basic Enemy (Moved from GameAssets.js and renamed) ---
export function createBasicEnemy() {
    const enemyGroup = new THREE.Group();
    const yShift = 0.55; // Amount to shift model up so base is at y=0

    // Enemy body (main sphere)
    const bodyGeometry = new THREE.IcosahedronGeometry(0.5, 0);
    const bodyMaterial = createMaterial(0xff5533);
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y += yShift; // Apply shift
    body.castShadow = true;
    body.receiveShadow = true;
    enemyGroup.add(body);

    // Add eyes
    const eyeGeometry = new THREE.SphereGeometry(0.1, 4, 4);
    const eyeMaterial = createMaterial(0xffffff);
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(0.25, 0.2 + yShift, 0.4); // Apply shift
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(-0.25, 0.2 + yShift, 0.4); // Apply shift

    // Pupils
    const pupilGeometry = new THREE.SphereGeometry(0.05, 4, 4);
    const pupilMaterial = createMaterial(0x000000);
    const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    leftPupil.position.set(0, 0, 0.05);
    leftEye.add(leftPupil);
    const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    rightPupil.position.set(0, 0, 0.05);
    rightEye.add(rightPupil);
    enemyGroup.add(leftEye);
    enemyGroup.add(rightEye);

    // Add stubby legs
    const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.3, 5);
    const legMaterial = createMaterial(0xe8432e);
    for (let i = 0; i < 4; i++) {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.castShadow = true;
        const angle = (i * Math.PI / 2);
        const x = Math.cos(angle) * 0.4;
        const z = Math.sin(angle) * 0.4;
        leg.position.set(x, -0.4 + yShift, z); // Apply shift
        leg.rotation.x = Math.PI / 2;
        enemyGroup.add(leg);
    }

    // Health Bar Group
    const healthBarGroup = new THREE.Group();
    const healthBarHeight = 0.15;
    const healthBarWidth = 1.0;
    const healthBarOffsetY = 0.8; // This offset is now relative to the shifted body center
    healthBarGroup.position.y = healthBarOffsetY + yShift; // Position the group, applying shift
    enemyGroup.add(healthBarGroup);

    // Background (red)
    const healthBarBgGeometry = new THREE.PlaneGeometry(healthBarWidth, healthBarHeight);
    const healthBarBgMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
    const healthBarBg = new THREE.Mesh(healthBarBgGeometry, healthBarBgMaterial);
    healthBarGroup.add(healthBarBg);

    // Foreground (green)
    const healthBarFgGeometry = new THREE.PlaneGeometry(healthBarWidth, healthBarHeight);
    const healthBarFgMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
    const healthBarFg = new THREE.Mesh(healthBarFgGeometry, healthBarFgMaterial);
    healthBarFg.position.z = 0.01;
    healthBarGroup.add(healthBarFg);

    enemyGroup.userData.type = 'enemy';
    enemyGroup.userData.enemyType = 'basic'; // Added type
    enemyGroup.userData.health = 100; // Default health
    enemyGroup.userData.speed = 1.5;  // Default speed
    enemyGroup.userData.value = 10;   // Default value
    enemyGroup.userData.healthBar = {
        group: healthBarGroup,
        background: healthBarBg,
        foreground: healthBarFg,
        maxWidth: healthBarWidth
    };

    return enemyGroup;
}


// --- New Enemy Types ---

// Fast Enemy - Small, quick triangular design
export function createFastEnemy() {
  const enemyGroup = new THREE.Group();
  const yShift = 0.2; // Adjust shift based on model base

  // Main body - flattened tetrahedron
  const bodyGeometry = new THREE.TetrahedronGeometry(0.4, 0);
  const bodyMaterial = createMaterial(0xffaa22);
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.scale.y = 0.6;
  body.rotation.x = Math.PI / 6;
  body.position.y += yShift;
  body.castShadow = true;
  body.receiveShadow = true;
  enemyGroup.add(body);

  // Add eyes
  const eyeGeometry = new THREE.SphereGeometry(0.08, 4, 4);
  const eyeMaterial = createMaterial(0xffffff);
  const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  leftEye.position.set(0.15, 0.1 + yShift, 0.3);
  const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  rightEye.position.set(-0.15, 0.1 + yShift, 0.3);

  // Pupils
  const pupilGeometry = new THREE.SphereGeometry(0.04, 4, 4);
  const pupilMaterial = createMaterial(0x000000);
  const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
  leftPupil.position.set(0, 0, 0.04);
  leftEye.add(leftPupil);
  const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
  rightPupil.position.set(0, 0, 0.04);
  rightEye.add(rightPupil);
  enemyGroup.add(leftEye);
  enemyGroup.add(rightEye);

  // Add fins/wings for fast appearance
  const finGeometry = new THREE.ConeGeometry(0.2, 0.4, 4);
  const finMaterial = createMaterial(0xff9900);
  const leftFin = new THREE.Mesh(finGeometry, finMaterial);
  leftFin.position.set(0.3, 0 + yShift, -0.1);
  leftFin.rotation.z = Math.PI / 2;
  leftFin.rotation.y = -Math.PI / 6;
  leftFin.castShadow = true;
  enemyGroup.add(leftFin);
  const rightFin = new THREE.Mesh(finGeometry, finMaterial);
  rightFin.position.set(-0.3, 0 + yShift, -0.1);
  rightFin.rotation.z = -Math.PI / 2;
  rightFin.rotation.y = Math.PI / 6;
  rightFin.castShadow = true;
  enemyGroup.add(rightFin);

  // Health Bar Group
  const healthBarGroup = new THREE.Group();
  const healthBarHeight = 0.12;
  const healthBarWidth = 0.8;
  const healthBarOffsetY = 0.5;
  healthBarGroup.position.y = healthBarOffsetY + yShift;
  enemyGroup.add(healthBarGroup);
  const healthBarBgGeometry = new THREE.PlaneGeometry(healthBarWidth, healthBarHeight);
  const healthBarBgMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
  const healthBarBg = new THREE.Mesh(healthBarBgGeometry, healthBarBgMaterial);
  healthBarGroup.add(healthBarBg);
  const healthBarFgGeometry = new THREE.PlaneGeometry(healthBarWidth, healthBarHeight);
  const healthBarFgMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
  const healthBarFg = new THREE.Mesh(healthBarFgGeometry, healthBarFgMaterial);
  healthBarFg.position.z = 0.01;
  healthBarGroup.add(healthBarFg);

  enemyGroup.userData.type = 'enemy';
  enemyGroup.userData.enemyType = 'fast';
  enemyGroup.userData.speed = 2.5; // Faster speed
  enemyGroup.userData.health = 60;
  enemyGroup.userData.value = 15;
  enemyGroup.userData.healthBar = { group: healthBarGroup, foreground: healthBarFg, maxWidth: healthBarWidth };

  return enemyGroup;
}

// Tank Enemy - Larger, slower with high health
export function createTankEnemy() {
  const enemyGroup = new THREE.Group();
  const yShift = 0.125; // Base is 0.25 high, centered at 0

  // Heavy base
  const baseGeometry = new THREE.BoxGeometry(0.9, 0.4, 1.1);
  const baseMaterial = createMaterial(0x556677);
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  base.position.y = 0.2 + yShift;
  base.castShadow = true;
  base.receiveShadow = true;
  enemyGroup.add(base);

  // Treads
  const treadGeometry = new THREE.BoxGeometry(1.1, 0.25, 1.2);
  const treadMaterial = createMaterial(0x333333);
  const treads = new THREE.Mesh(treadGeometry, treadMaterial);
  treads.position.y = 0 + yShift;
  treads.castShadow = true;
  treads.receiveShadow = true;
  enemyGroup.add(treads);

  // Turret base
  const turretBaseGeometry = new THREE.CylinderGeometry(0.35, 0.4, 0.3, 6);
  const turretBaseMaterial = createMaterial(0x445566);
  const turretBase = new THREE.Mesh(turretBaseGeometry, turretBaseMaterial);
  turretBase.position.y = 0.55 + yShift;
  turretBase.castShadow = true;
  turretBase.receiveShadow = true;
  enemyGroup.add(turretBase);

  // Turret top
  const turretTopGeometry = new THREE.BoxGeometry(0.5, 0.25, 0.6);
  const turretTopMaterial = createMaterial(0x334455);
  const turretTop = new THREE.Mesh(turretTopGeometry, turretTopMaterial);
  turretTop.position.y = 0.8 + yShift;
  turretTop.castShadow = true;
  turretTop.receiveShadow = true;
  enemyGroup.add(turretTop);

  // Gun
  const gunGeometry = new THREE.BoxGeometry(0.15, 0.15, 0.6);
  const gunMaterial = createMaterial(0x222222);
  const gun = new THREE.Mesh(gunGeometry, gunMaterial);
  gun.position.set(0, 0.8 + yShift, 0.5);
  gun.castShadow = true;
  enemyGroup.add(gun);

  // Eyes/Viewports
  const viewportGeometry = new THREE.BoxGeometry(0.15, 0.08, 0.05);
  const viewportMaterial = createMaterial(0xff3333, true);
  const leftViewport = new THREE.Mesh(viewportGeometry, viewportMaterial);
  leftViewport.position.set(0.2, 0.8 + yShift, 0.3);
  enemyGroup.add(leftViewport);
  const rightViewport = new THREE.Mesh(viewportGeometry, viewportMaterial);
  rightViewport.position.set(-0.2, 0.8 + yShift, 0.3);
  enemyGroup.add(rightViewport);

  // Health Bar Group
  const healthBarGroup = new THREE.Group();
  const healthBarHeight = 0.18;
  const healthBarWidth = 1.2;
  const healthBarOffsetY = 1.1;
  healthBarGroup.position.y = healthBarOffsetY + yShift;
  enemyGroup.add(healthBarGroup);
  const healthBarBgGeometry = new THREE.PlaneGeometry(healthBarWidth, healthBarHeight);
  const healthBarBgMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
  const healthBarBg = new THREE.Mesh(healthBarBgGeometry, healthBarBgMaterial);
  healthBarGroup.add(healthBarBg);
  const healthBarFgGeometry = new THREE.PlaneGeometry(healthBarWidth, healthBarHeight);
  const healthBarFgMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
  const healthBarFg = new THREE.Mesh(healthBarFgGeometry, healthBarFgMaterial);
  healthBarFg.position.z = 0.01;
  healthBarGroup.add(healthBarFg);

  enemyGroup.userData.type = 'enemy';
  enemyGroup.userData.enemyType = 'tank';
  enemyGroup.userData.speed = 0.8; // Slower speed
  enemyGroup.userData.health = 250;
  enemyGroup.userData.value = 30;
  enemyGroup.userData.healthBar = { group: healthBarGroup, foreground: healthBarFg, maxWidth: healthBarWidth };

  return enemyGroup;
}

// Flying Enemy - Hovers above the ground, ignores terrain obstacles
// Note: Pathfinding logic needs adjustment for flying units
export function createFlyingEnemy() {
  const enemyGroup = new THREE.Group();
  const yShift = 0.0; // Base is centered at y=0

  // Body - flattened disc
  const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 8);
  const bodyMaterial = createMaterial(0x9966ff);
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y += yShift;
  body.castShadow = true;
  enemyGroup.add(body);

  // Top dome
  const domeGeometry = new THREE.SphereGeometry(0.4, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2);
  const domeMaterial = createMaterial(0x7744dd);
  const dome = new THREE.Mesh(domeGeometry, domeMaterial);
  dome.position.y = 0.1 + yShift;
  dome.castShadow = true;
  enemyGroup.add(dome);

  // Bottom dome - slight glow for hover effect
  const bottomGeometry = new THREE.SphereGeometry(0.4, 8, 4, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
  const bottomMaterial = createMaterial(0xaa88ff, true);
  const bottom = new THREE.Mesh(bottomGeometry, bottomMaterial);
  bottom.position.y = -0.1 + yShift;
  enemyGroup.add(bottom);

  // Antenna
  const antennaGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 4);
  const antennaMaterial = createMaterial(0x555555);
  const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
  antenna.position.y = 0.35 + yShift;
  antenna.castShadow = true;
  enemyGroup.add(antenna);

  // Antenna tip
  const tipGeometry = new THREE.SphereGeometry(0.05, 6, 6);
  const tipMaterial = createMaterial(0xff0000, true);
  const tip = new THREE.Mesh(tipGeometry, tipMaterial);
  tip.position.y = 0.5 + yShift;
  enemyGroup.add(tip);

  // Windows/eyes around the edge
  const windowGeometry = new THREE.BoxGeometry(0.12, 0.06, 0.06);
  const windowMaterial = createMaterial(0xaaffff, true);
  for (let i = 0; i < 8; i++) {
    const window = new THREE.Mesh(windowGeometry, windowMaterial);
    const angle = (i / 8) * Math.PI * 2;
    window.position.set(
      Math.cos(angle) * 0.45,
      0 + yShift,
      Math.sin(angle) * 0.45
    );
    window.rotation.y = angle + Math.PI / 2;
    enemyGroup.add(window);
  }

  // Health Bar Group
  const healthBarGroup = new THREE.Group();
  const healthBarHeight = 0.15;
  const healthBarWidth = 1.0;
  const healthBarOffsetY = 0.7;
  healthBarGroup.position.y = healthBarOffsetY + yShift;
  enemyGroup.add(healthBarGroup);
  const healthBarBgGeometry = new THREE.PlaneGeometry(healthBarWidth, healthBarHeight);
  const healthBarBgMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
  const healthBarBg = new THREE.Mesh(healthBarBgGeometry, healthBarBgMaterial);
  healthBarGroup.add(healthBarBg);
  const healthBarFgGeometry = new THREE.PlaneGeometry(healthBarWidth, healthBarHeight);
  const healthBarFgMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
  const healthBarFg = new THREE.Mesh(healthBarFgGeometry, healthBarFgMaterial);
  healthBarFg.position.z = 0.01;
  healthBarGroup.add(healthBarFg);

  enemyGroup.userData.type = 'enemy';
  enemyGroup.userData.enemyType = 'flying';
  enemyGroup.userData.speed = 1.2;
  enemyGroup.userData.health = 100;
  enemyGroup.userData.value = 25;
  enemyGroup.userData.flying = true; // Flag for special movement/targeting
  enemyGroup.userData.hoverHeight = 2.0; // Height above path
  enemyGroup.userData.healthBar = { group: healthBarGroup, foreground: healthBarFg, maxWidth: healthBarWidth };

  return enemyGroup;
}

// Swarm Enemy - Multiple small units that move together
// Note: Needs special handling for health/damage distribution and animation
export function createSwarmEnemy() {
  const enemyGroup = new THREE.Group();
  const yShift = 0.1; // Base is tetrahedron centered at 0

  // Create several small units
  const colors = [0x22ff22, 0x55dd55, 0x88bb88];
  const units = [];

  for (let i = 0; i < 7; i++) {
    const unitGeometry = new THREE.TetrahedronGeometry(0.2, 0);
    const unitMaterial = createMaterial(colors[i % colors.length]);
    const unit = new THREE.Mesh(unitGeometry, unitMaterial);
    unit.castShadow = true;

    // Arrange in a loose formation
    const angle = (i / 7) * Math.PI * 2;
    const radius = 0.3 + Math.random() * 0.2;
    unit.position.set(
      Math.cos(angle) * radius,
      (Math.random() * 0.3) + yShift,
      Math.sin(angle) * radius
    );
    unit.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

    // Add eyes to each unit
    const eyeGeometry = new THREE.SphereGeometry(0.06, 4, 4);
    const eyeMaterial = createMaterial(0xffffff);
    const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    eye.position.set(0, 0, 0.15); // Position eye on the "front" face
    const pupilGeometry = new THREE.SphereGeometry(0.03, 4, 4);
    const pupilMaterial = createMaterial(0x000000);
    const pupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    pupil.position.z = 0.03;
    eye.add(pupil);
    unit.add(eye);

    enemyGroup.add(unit);
    units.push(unit); // Keep track of units

    // Store original position for animation
    unit.userData.originalPos = unit.position.clone();
    unit.userData.bobSpeed = 0.5 + Math.random() * 0.5;
    unit.userData.bobHeight = 0.05 + Math.random() * 0.1;
    unit.userData.bobOffset = Math.random() * Math.PI * 2; // Random start phase
  }

  // Health Bar Group (Positioned above the swarm center)
  const healthBarGroup = new THREE.Group();
  const healthBarHeight = 0.15;
  const healthBarWidth = 1.0;
  const healthBarOffsetY = 0.8;
  healthBarGroup.position.y = healthBarOffsetY + yShift;
  enemyGroup.add(healthBarGroup);
  const healthBarBgGeometry = new THREE.PlaneGeometry(healthBarWidth, healthBarHeight);
  const healthBarBgMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
  const healthBarBg = new THREE.Mesh(healthBarBgGeometry, healthBarBgMaterial);
  healthBarGroup.add(healthBarBg);
  const healthBarFgGeometry = new THREE.PlaneGeometry(healthBarWidth, healthBarHeight);
  const healthBarFgMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
  const healthBarFg = new THREE.Mesh(healthBarFgGeometry, healthBarFgMaterial);
  healthBarFg.position.z = 0.01;
  healthBarGroup.add(healthBarFg);

  enemyGroup.userData.type = 'enemy';
  enemyGroup.userData.enemyType = 'swarm';
  enemyGroup.userData.speed = 1.0;
  enemyGroup.userData.health = 140; // Combined health
  enemyGroup.userData.value = 35;
  enemyGroup.userData.units = units; // Store refs to individual units
  enemyGroup.userData.healthBar = { group: healthBarGroup, foreground: healthBarFg, maxWidth: healthBarWidth };

  return enemyGroup;
}


// Boss Enemy - Large enemy with special abilities
export function createBossEnemy() {
  const enemyGroup = new THREE.Group();
  const yShift = 0.3; // Adjust based on leg length/core position

  // Heavy core
  const coreGeometry = new THREE.DodecahedronGeometry(0.7, 1);
  const coreMaterial = createMaterial(0xff0066);
  const core = new THREE.Mesh(coreGeometry, coreMaterial);
  core.position.y += yShift;
  core.castShadow = true;
  core.receiveShadow = true;
  enemyGroup.add(core);

  // Armor plates
  const plateGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.2);
  const plateMaterial = createMaterial(0xaa0044);
  const positions = [
    { x: 0.6, y: 0.4, z: 0.4, rx: 0.3, ry: 0.5, rz: 0.2 }, { x: -0.6, y: 0.4, z: 0.4, rx: 0.3, ry: -0.5, rz: -0.2 },
    { x: 0.6, y: -0.4, z: 0.4, rx: -0.3, ry: 0.5, rz: -0.2 }, { x: -0.6, y: -0.4, z: 0.4, rx: -0.3, ry: -0.5, rz: 0.2 },
    { x: 0.6, y: 0.4, z: -0.4, rx: 0.3, ry: -0.5, rz: 0.2 }, { x: -0.6, y: 0.4, z: -0.4, rx: 0.3, ry: 0.5, rz: -0.2 },
    { x: 0.6, y: -0.4, z: -0.4, rx: -0.3, ry: -0.5, rz: -0.2 }, { x: -0.6, y: -0.4, z: -0.4, rx: -0.3, ry: 0.5, rz: 0.2 }
  ];
  positions.forEach(pos => {
    const plate = new THREE.Mesh(plateGeometry, plateMaterial);
    plate.position.set(pos.x, pos.y + yShift, pos.z);
    plate.rotation.set(pos.rx, pos.ry, pos.rz);
    plate.castShadow = true;
    plate.receiveShadow = true;
    enemyGroup.add(plate);
  });

  // Energy core (visible through gaps in armor)
  const energyGeometry = new THREE.SphereGeometry(0.4, 8, 8);
  const energyMaterial = createMaterial(0xff88aa, true);
  const energy = new THREE.Mesh(energyGeometry, energyMaterial);
  energy.position.y += yShift;
  enemyGroup.add(energy);

  // Eye
  const eyeGeometry = new THREE.SphereGeometry(0.2, 8, 8);
  const eyeMaterial = createMaterial(0xff0000, true);
  const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  eye.position.set(0, 0 + yShift, 0.7);
  enemyGroup.add(eye);

  // Multiple legs
  const legGeometry = new THREE.ConeGeometry(0.15, 0.6, 4);
  const legMaterial = createMaterial(0x880033);
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const leg = new THREE.Mesh(legGeometry, legMaterial);
    leg.position.set( Math.cos(angle) * 0.8, -0.7 + yShift, Math.sin(angle) * 0.8 );
    leg.rotation.x = Math.PI / 2;
    leg.rotation.z = -angle;
    leg.castShadow = true;
    enemyGroup.add(leg);
  }

  // Weapon attachments
  const weapon1Geometry = new THREE.BoxGeometry(0.25, 0.25, 0.5);
  const weapon1Material = createMaterial(0x222222);
  const weapon1 = new THREE.Mesh(weapon1Geometry, weapon1Material);
  weapon1.position.set(0.5, 0 + yShift, 0.6);
  weapon1.castShadow = true;
  enemyGroup.add(weapon1);
  const weapon2Geometry = new THREE.BoxGeometry(0.25, 0.25, 0.5);
  const weapon2Material = createMaterial(0x222222);
  const weapon2 = new THREE.Mesh(weapon2Geometry, weapon2Material);
  weapon2.position.set(-0.5, 0 + yShift, 0.6);
  weapon2.castShadow = true;
  enemyGroup.add(weapon2);

  // Weapon energy tips
  const tipGeometry = new THREE.BoxGeometry(0.15, 0.15, 0.1);
  const tipMaterial = createMaterial(0xff00ff, true);
  const tip1 = new THREE.Mesh(tipGeometry, tipMaterial);
  tip1.position.set(0.5, 0 + yShift, 0.9);
  enemyGroup.add(tip1);
  const tip2 = new THREE.Mesh(tipGeometry, tipMaterial);
  tip2.position.set(-0.5, 0 + yShift, 0.9);
  enemyGroup.add(tip2);

  // Health Bar Group
  const healthBarGroup = new THREE.Group();
  const healthBarHeight = 0.2;
  const healthBarWidth = 1.5;
  const healthBarOffsetY = 1.2;
  healthBarGroup.position.y = healthBarOffsetY + yShift;
  enemyGroup.add(healthBarGroup);
  const healthBarBgGeometry = new THREE.PlaneGeometry(healthBarWidth, healthBarHeight);
  const healthBarBgMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
  const healthBarBg = new THREE.Mesh(healthBarBgGeometry, healthBarBgMaterial);
  healthBarGroup.add(healthBarBg);
  const healthBarFgGeometry = new THREE.PlaneGeometry(healthBarWidth, healthBarHeight);
  const healthBarFgMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
  const healthBarFg = new THREE.Mesh(healthBarFgGeometry, healthBarFgMaterial);
  healthBarFg.position.z = 0.01;
  healthBarGroup.add(healthBarFg);

  enemyGroup.userData.type = 'enemy';
  enemyGroup.userData.enemyType = 'boss';
  enemyGroup.userData.speed = 0.4;
  enemyGroup.userData.health = 600;
  enemyGroup.userData.value = 100;
  enemyGroup.userData.isBoss = true;
  enemyGroup.userData.healthBar = { group: healthBarGroup, foreground: healthBarFg, maxWidth: healthBarWidth };

  return enemyGroup;
}
