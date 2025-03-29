import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'; // Import OrbitControls
import { createGameWorld, createEnemy, createBasicTower, createProjectile, createDeathEffect } from '../assets/GameAssets.js';

// Define the path for enemies (array of Vector3 points)
// This should match the visual path created in createGameWorld
const enemyPath = [
    new THREE.Vector3(4, 0.5, 0),   // Start point (adjust based on map)
    new THREE.Vector3(4, 0.5, 8.75), // Corner 1 (z = 5 * 1.75)
    new THREE.Vector3(13, 0.5, 8.75), // End point (x = (6 + 0.5) * 2) - Check this calculation if map changes
];

// Wave Configuration: [ { count: number, delay: seconds } ]
const waveConfig = [
    { count: 5, delay: 1.0 }, // Wave 1
    { count: 8, delay: 0.8 }, // Wave 2
    { count: 12, delay: 0.6 }, // Wave 3
];

export class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000); // Adjusted FOV
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.clock = new THREE.Clock();
        this.controls = null; // Placeholder for OrbitControls
        this.placementHelper = null; // Placeholder for tower placement visualizer

        this.init();
    }
    
    init() {
        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        document.getElementById('game-container').appendChild(this.renderer.domElement);
        // Setup camera
        this.camera.position.set(8, 15, 18); // Adjusted camera position for better overview
        this.camera.lookAt(8, 0, 8); // Look towards the center of the typical map area

        // Setup OrbitControls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.target.set(8, 0, 8); // Set the center point for orbiting
        this.controls.enableDamping = true; // Smooth camera movement
        this.controls.dampingFactor = 0.1;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.1; // Limit vertical rotation slightly
        this.controls.minDistance = 5;
        this.controls.maxDistance = 30;

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        this.scene.add(directionalLight);
        
        // Create game world
        this.world = createGameWorld();
        this.scene.add(this.world);
        
        // Initialize game state
        this.towers = [];
        this.enemies = [];
        this.projectiles = [];
        this.effects = []; // For death effects
        this.resources = 100;
        this.baseHealth = 100;
        this.currentWave = 0; // Start at wave 0 (before first wave)
        this.enemyPath = enemyPath; // Store the path
        this.waveConfig = waveConfig;
        this.gameState = 'idle'; // States: idle, wave_spawning, wave_active, wave_complete, game_over, victory
        this.enemiesToSpawn = 0;
        this.spawnTimer = 0;
        this.spawnDelay = 0;

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Add mouse move listener for placement helper
        this.renderer.domElement.addEventListener('mousemove', (event) => this.onMouseMove(event));
        // Add click event listener for tower placement
        this.renderer.domElement.addEventListener('click', (event) => this.onMouseClick(event));

        // Hide loading screen
        document.getElementById('loading-screen').style.display = 'none';
        
        // Start game loop
        this.gameState = 'idle'; // Initial state before first wave
        this.updateUI(); // Initial UI update
        this.animate();
    }

    updateUI() {
        document.getElementById('resource-count').textContent = this.resources;
        document.getElementById('health-count').textContent = this.baseHealth;
        document.getElementById('wave-number').textContent = this.currentWave > 0 ? this.currentWave : '-';

        const startButton = document.getElementById('start-wave');
        if (this.gameState === 'idle' || this.gameState === 'wave_complete') {
            startButton.disabled = false;
            startButton.textContent = `Start Wave ${this.currentWave + 1}`;
        } else {
            startButton.disabled = true;
            startButton.textContent = 'Wave in Progress...';
        }

        if (this.gameState === 'victory') {
             startButton.textContent = 'You Win!';
             startButton.disabled = true;
        } else if (this.gameState === 'game_over') {
             startButton.textContent = 'Game Over!';
             startButton.disabled = true;
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    onMouseClick(event) {
        // Convert mouse position to normalized device coordinates
        const mouse = new THREE.Vector2(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        );
        
        // Create raycaster
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);
        
        // Find intersections with tiles
        const intersects = raycaster.intersectObjects(this.world.children, true);
        if (intersects.length > 0) {
            let clickedObject = intersects[0].object;
            // Traverse up to find the main tile group if a child mesh was clicked
            while (clickedObject.parent && clickedObject.userData.type !== 'tile') {
                clickedObject = clickedObject.parent;
            }
            
            const tile = clickedObject; // Now it should be the tile group

            if (tile && tile.userData.type === 'tile' && tile.userData.buildable && this.resources >= 50) {
                // Place tower
                const tower = createBasicTower();
                tower.position.copy(tile.position);
                tower.position.y = 0.2; // Adjust height
                this.scene.add(tower);
                this.towers.push(tower);

                // Hide placement helper after placing
                if (this.placementHelper) {
                    this.placementHelper.visible = false;
                }
                
                // Update resources
                this.resources -= 50;
                document.getElementById('resource-count').textContent = this.resources;
                
                // Mark tile as non-buildable
                tile.userData.buildable = false;
            }
        }
    }
    
    spawnEnemy() {
        const enemy = createEnemy();
        enemy.position.copy(this.enemyPath[0]); // Start at the beginning of the path
        enemy.userData.health = 100; // Give enemy health
        enemy.userData.pathIndex = 0; // Current target point index
        enemy.userData.speed = 1.5; // Movement speed
        this.scene.add(enemy);
        this.enemies.push(enemy);
    }

    updateEnemies(deltaTime) {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            // Check if enemy reached the end
            if (enemy.userData.pathIndex >= this.enemyPath.length - 1) {
                this.baseHealth -= 10; // Reduce base health
                this.updateUI(); // Update UI after health change
                this.removeEnemy(enemy, i);
                if (this.baseHealth <= 0 && this.gameState !== 'game_over') {
                    this.setGameState('game_over');
                }
                continue;
            }

            // Move towards the next point in the path
            const targetPoint = this.enemyPath[enemy.userData.pathIndex + 1];
            const direction = targetPoint.clone().sub(enemy.position).normalize();
            const distanceToTarget = enemy.position.distanceTo(targetPoint);
            const moveDistance = enemy.userData.speed * deltaTime;

            if (moveDistance >= distanceToTarget) {
                // Reached the point, move to the next one
                enemy.position.copy(targetPoint);
                enemy.userData.pathIndex++;
            } else {
                enemy.position.add(direction.multiplyScalar(moveDistance));
            }
        }
    }

    updateTowers(deltaTime) {
        for (const tower of this.towers) {
            // Initialize tower properties if not already set
            if (tower.userData.attackCooldown === undefined) {
                tower.userData.range = 5; // Tower attack range
                tower.userData.damage = 25; // Tower damage
                tower.userData.attackSpeed = 1; // Attacks per second
                tower.userData.attackCooldown = 0; // Time until next attack
            }

            // Update cooldown
            tower.userData.attackCooldown -= deltaTime;

            // Find target if cooldown is ready
            if (tower.userData.attackCooldown <= 0) {
                let target = null;
                let minDistance = tower.userData.range;

                for (const enemy of this.enemies) {
                    const distance = tower.position.distanceTo(enemy.position);
                    if (distance < minDistance) {
                        minDistance = distance;
                        target = enemy;
                    }
                }

                if (target) {
                    // Aim turret
                    tower.userData.turret.lookAt(target.position);
                    
                    // Shoot projectile
                    this.shootProjectile(tower, target);
                    
                    // Reset cooldown
                    tower.userData.attackCooldown = 1 / tower.userData.attackSpeed;
                }
            }
        }
    }

    shootProjectile(tower, target) {
        const projectile = createProjectile();
        // Start projectile slightly above the cannon
        const startPosition = tower.userData.turret.localToWorld(new THREE.Vector3(0, 0.1, 0.5)); 
        projectile.position.copy(startPosition);
        
        projectile.userData.target = target;
        projectile.userData.speed = 10; // Projectile speed
        projectile.userData.damage = tower.userData.damage;
        
        this.scene.add(projectile);
        this.projectiles.push(projectile);
    }

    updateProjectiles(deltaTime) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            const target = projectile.userData.target;

            // If target is gone, remove projectile
            if (!target || !this.enemies.includes(target)) {
                this.removeProjectile(projectile, i);
                continue;
            }

            // Move projectile towards target
            const direction = target.position.clone().sub(projectile.position).normalize();
            const moveDistance = projectile.userData.speed * deltaTime;
            projectile.position.add(direction.multiplyScalar(moveDistance));

            // Check for collision
            if (projectile.position.distanceTo(target.position) < 0.5) { // Collision threshold
                target.userData.health -= projectile.userData.damage;
                
                // Check if enemy died
                if (target.userData.health <= 0) {
                    this.resources += 10; // Grant resources
                    this.updateUI(); // Update UI after resource gain

                    // Find the enemy index before removing
                    const enemyIndex = this.enemies.indexOf(target);
                    if (enemyIndex !== -1) {
                        this.removeEnemy(target, enemyIndex, true); // Remove with effect
                    }
                }
                
                this.removeProjectile(projectile, i);
            }
        }
    }
    
    removeEnemy(enemy, index, useEffect = false) {
        if (useEffect) {
            const effect = createDeathEffect(enemy.position);
            this.scene.add(effect);
            this.effects.push(effect);
        }
        this.scene.remove(enemy);
        this.enemies.splice(index, 1);
    }

    removeProjectile(projectile, index) {
        this.scene.remove(projectile);
        this.projectiles.splice(index, 1);
    }

    updateEffects(deltaTime) {
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const effect = this.effects[i];
            effect.userData.age += 1; // Increment age (frames)

            // Animate particles
            for (const particle of effect.children) {
                particle.position.add(particle.userData.velocity);
                particle.rotation.x += particle.userData.rotationSpeed.x;
                particle.rotation.y += particle.userData.rotationSpeed.y;
                particle.rotation.z += particle.userData.rotationSpeed.z;
                particle.userData.velocity.y -= 0.005; // Gravity
            }

            if (effect.userData.age >= effect.userData.lifetime) {
                this.scene.remove(effect);
                this.effects.splice(i, 1);
            }
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        const deltaTime = this.clock.getDelta();

        // Update controls
        this.controls.update();

        // Update game objects
        this.updateEnemies(deltaTime);
        this.updateTowers(deltaTime);
        this.updateProjectiles(deltaTime);
        this.updateEffects(deltaTime);

        // Render scene
        this.renderer.render(this.scene, this.camera);
    }

    setGameState(newState) {
        if (this.gameState === newState) return; // No change

        console.log(`Game State Change: ${this.gameState} -> ${newState}`);
        this.gameState = newState;

        // Handle state transitions
        if (newState === 'game_over') {
            alert("Game Over!"); // Simple alert for now
        } else if (newState === 'victory') {
            alert("Victory!"); // Simple alert for now
        }

        this.updateUI(); // Update UI based on new state
    }

    startNextWave() {
        if ((this.gameState === 'idle' || this.gameState === 'wave_complete') && this.currentWave < this.waveConfig.length) {
            this.currentWave++;
            const waveData = this.waveConfig[this.currentWave - 1];
            this.enemiesToSpawn = waveData.count;
            this.spawnDelay = waveData.delay;
            this.spawnTimer = this.spawnDelay; // Start timer for first spawn
            this.setGameState('wave_spawning');
            this.updateUI();
        }
    }

    updateWaveSpawning(deltaTime) {
        if (this.gameState === 'wave_spawning') {
            this.spawnTimer -= deltaTime;
            if (this.spawnTimer <= 0 && this.enemiesToSpawn > 0) {
                this.spawnEnemy();
                this.enemiesToSpawn--;
                this.spawnTimer = this.spawnDelay; // Reset timer for next spawn

                if (this.enemiesToSpawn === 0) {
                    // All enemies for this wave have been spawned
                    this.setGameState('wave_active');
                }
            }
        }
    }

    // Add mouse move handler for placement helper
    onMouseMove(event) {
        const mouse = new THREE.Vector2(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        );
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);
        const intersects = raycaster.intersectObjects(this.world.children, true);

        if (intersects.length > 0) {
            let intersectedObject = intersects[0].object;
             while (intersectedObject.parent && intersectedObject.userData.type !== 'tile') {
                intersectedObject = intersectedObject.parent;
            }
            const tile = intersectedObject;

            if (tile && tile.userData.type === 'tile' && tile.userData.buildable) {
                if (!this.placementHelper) {
                    // Create a semi-transparent tower model for placement preview
                    this.placementHelper = createBasicTower();
                    this.placementHelper.traverse((child) => {
                        if (child.isMesh) {
                            child.material = child.material.clone(); // Clone material to avoid affecting others
                            child.material.transparent = true;
                            child.material.opacity = 0.5;
                        }
                    });
                    // Make range indicator visible for helper
                    if (this.placementHelper.userData.rangeIndicator) {
                         this.placementHelper.userData.rangeIndicator.visible = true;
                         this.placementHelper.userData.rangeIndicator.material.opacity = 0.1; // More subtle
                    }
                    this.scene.add(this.placementHelper);
                }
                this.placementHelper.position.copy(tile.position);
                this.placementHelper.position.y = 0.2;
                this.placementHelper.visible = true;
            } else if (this.placementHelper) {
                this.placementHelper.visible = false;
            }
        } else if (this.placementHelper) {
            this.placementHelper.visible = false;
        }
    }
}
