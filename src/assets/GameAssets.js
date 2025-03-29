import * as THREE from 'three';

// Utility function to create a basic material with optional color
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

// Create a basic enemy
export function createEnemy() {
    const enemyGroup = new THREE.Group();
    
    // Enemy body (main sphere)
    const bodyGeometry = new THREE.IcosahedronGeometry(0.5, 0);
    const bodyMaterial = createMaterial(0xff5533);
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true; // Enemy body casts shadow
    body.receiveShadow = true; // Enemy body can receive shadow
    enemyGroup.add(body);

    // Add eyes
    const eyeGeometry = new THREE.SphereGeometry(0.1, 4, 4);
    const eyeMaterial = createMaterial(0xffffff);
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(0.25, 0.2, 0.4);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(-0.25, 0.2, 0.4);
    
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
        leg.castShadow = true; // Legs cast shadow
        const angle = (i * Math.PI / 2);
        const x = Math.cos(angle) * 0.4;
        const z = Math.sin(angle) * 0.4;
        
        leg.position.set(x, -0.4, z);
        leg.rotation.x = Math.PI / 2;
        enemyGroup.add(leg);
    }
    
    // Health Bar
    const healthBarHeight = 0.15;
    const healthBarWidth = 1.0;
    const healthBarOffsetY = 0.8; // Position above the enemy body

    // Background (red)
    const healthBarBgGeometry = new THREE.PlaneGeometry(healthBarWidth, healthBarHeight);
    const healthBarBgMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
    const healthBarBg = new THREE.Mesh(healthBarBgGeometry, healthBarBgMaterial);
    healthBarBg.position.y = healthBarOffsetY;
    enemyGroup.add(healthBarBg);

    // Foreground (green)
    const healthBarFgGeometry = new THREE.PlaneGeometry(healthBarWidth, healthBarHeight);
    const healthBarFgMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
    const healthBarFg = new THREE.Mesh(healthBarFgGeometry, healthBarFgMaterial);
    healthBarFg.position.y = healthBarOffsetY;
    healthBarFg.position.z = 0.01; // Slightly in front of the background
    enemyGroup.add(healthBarFg);

    enemyGroup.userData.type = 'enemy';
    enemyGroup.userData.healthBar = {
        background: healthBarBg,
        foreground: healthBarFg,
        maxWidth: healthBarWidth
    };

    return enemyGroup;
}

// Create the basic shooter tower
export function createBasicTower() {
    const towerGroup = new THREE.Group();
    
    // Base
    const baseGeometry = new THREE.CylinderGeometry(0.6, 0.8, 0.5, 6);
    const baseMaterial = createMaterial(0x44aadd);
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.castShadow = true;
    base.receiveShadow = true;
    base.position.y = 0.25;
    towerGroup.add(base);

    // Middle section
    const middleGeometry = new THREE.CylinderGeometry(0.5, 0.6, 0.5, 6);
    const middleMaterial = createMaterial(0x3399cc);
    const middle = new THREE.Mesh(middleGeometry, middleMaterial);
    middle.castShadow = true;
    middle.receiveShadow = true;
    middle.position.y = 0.75;
    towerGroup.add(middle);

    // Create turret group (this will rotate to aim)
    const turretGroup = new THREE.Group();
    turretGroup.position.y = 1.1;
    towerGroup.add(turretGroup);
    towerGroup.userData.turret = turretGroup;
    
    // Turret base
    const turretBaseGeometry = new THREE.CylinderGeometry(0.4, 0.5, 0.2, 6);
    const turretBaseMaterial = createMaterial(0xaaddff);
    const turretBase = new THREE.Mesh(turretBaseGeometry, turretBaseMaterial);
    turretBase.castShadow = true;
    turretBase.receiveShadow = true;
    turretGroup.add(turretBase);

    // Cannon
    const cannonGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.6, 6);
    const cannonMaterial = createMaterial(0x333333);
    const cannon = new THREE.Mesh(cannonGeometry, cannonMaterial);
    cannon.castShadow = true;
    cannon.rotation.x = Math.PI / 2;
    cannon.position.z = 0.4;
    turretGroup.add(cannon);
    
    // Range indicator
    const rangeGeometry = new THREE.RingGeometry(0, 5, 32);
    const rangeMaterial = new THREE.MeshBasicMaterial({
        color: 0x44aaff,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide
    });
    const range = new THREE.Mesh(rangeGeometry, rangeMaterial);
    range.rotation.x = -Math.PI / 2;
    range.position.y = 0.1;
    range.visible = false;
    towerGroup.add(range);
    towerGroup.userData.rangeIndicator = range;
    
    towerGroup.userData.type = 'tower';
    return towerGroup;
}

// Create a bullet/projectile
export function createProjectile() {
    const geometry = new THREE.SphereGeometry(0.15, 6, 6);
    const material = createMaterial(0x88ddff, true);
    const projectile = new THREE.Mesh(geometry, material);
    
    projectile.userData.type = 'projectile';
    return projectile;
}

// Create terrain tile
export function createTile(type = 'buildable') {
    const tileGroup = new THREE.Group();
    
    // Different colors based on tile type
    let color = 0x88aa66; // Buildable tile (grass)
    if (type === 'path') {
        color = 0xccbb88; // Path tile (dirt)
    } else if (type === 'start') {
        color = 0xff3333; // Start tile (red)
    } else if (type === 'end') {
        color = 0x3333ff; // End tile (blue)
    }
    
    // Base hex tile
    const tileGeometry = new THREE.CylinderGeometry(1, 1, 0.2, 6);
    const tileMaterial = createMaterial(color);
    const tile = new THREE.Mesh(tileGeometry, tileMaterial);
    tile.receiveShadow = true; // Tiles receive shadows
    tile.position.y = 0.1;
    tileGroup.add(tile);

    // Add special features based on tile type
    if (type === 'start' || type === 'end') {
        const portalGeometry = new THREE.TorusGeometry(0.6, 0.1, 8, 16);
        const portalMaterial = createMaterial(type === 'start' ? 0xff0000 : 0x0000ff, true);
        const portal = new THREE.Mesh(portalGeometry, portalMaterial);
        portal.rotation.x = Math.PI / 2;
        portal.position.y = 0.3;
        tileGroup.add(portal);
    }
    
    tileGroup.userData.type = 'tile';
    tileGroup.userData.tileType = type;
    tileGroup.userData.walkable = (type === 'path' || type === 'start' || type === 'end');
    tileGroup.userData.buildable = (type === 'buildable');
    
    return tileGroup;
}

export function createDeathEffect(position) {
    const particleGroup = new THREE.Group();
    particleGroup.position.copy(position);
    
    const shapes = [
        new THREE.TetrahedronGeometry(0.2, 0),
        new THREE.BoxGeometry(0.15, 0.15, 0.15),
        new THREE.OctahedronGeometry(0.15, 0)
    ];
    
    const material = createMaterial(0xff5533);
    const particleCount = 8 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < particleCount; i++) {
        const shapeIndex = Math.floor(Math.random() * shapes.length);
        const particle = new THREE.Mesh(shapes[shapeIndex], material);
        
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 0.2;
        particle.position.set(
            Math.cos(angle) * distance,
            Math.random() * 0.2,
            Math.sin(angle) * distance
        );
        
        particle.userData.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.1,
            Math.random() * 0.15,
            (Math.random() - 0.5) * 0.1
        );
        
        particle.userData.rotationSpeed = {
            x: (Math.random() - 0.5) * 0.2,
            y: (Math.random() - 0.5) * 0.2,
            z: (Math.random() - 0.5) * 0.2
        };
        
        particleGroup.add(particle);
    }
    
    particleGroup.userData.type = 'effect';
    particleGroup.userData.lifetime = 60;
    particleGroup.userData.age = 0;
    
    return particleGroup;
}

// Create game world with a specific map layout
export function createGameWorld(mapSize = 8) {
    const worldGroup = new THREE.Group();
    
    // Create a grid of tiles
    for (let x = 0; x < mapSize; x++) {
        for (let z = 0; z < mapSize; z++) {
            // Determine tile type based on a simple path
            let tileType = 'buildable';
            
            // Create a simple L-shaped path
            if ((x === 2 && z <= 5) || (z === 5 && x >= 2 && x <= 6)) {
                tileType = 'path';
            }
            
            // Set start and end points
            if (x === 2 && z === 0) {
                tileType = 'start';
            } else if (x === 6 && z === 5) {
                tileType = 'end';
            }
            
            const tile = createTile(tileType);
            
            // Position the tile in the grid
            // Using hexagonal positioning for a more interesting look
            const offset = z % 2 === 0 ? 0 : 1;
            tile.position.set(
                (x + offset * 0.5) * 2,
                0,
                z * 1.75
            );
            
            worldGroup.add(tile);
        }
    }
    
    worldGroup.userData.type = 'world';
    return worldGroup;
}
