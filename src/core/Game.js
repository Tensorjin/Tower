import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { 
    createGameWorld,
    createBasicTower,
    createDeathEffect,
    createBasicEnemy,
    createFastEnemy,
    createTankEnemy,
    createFlyingEnemy,
    createSwarmEnemy,
    createBossEnemy
} from '../assets/GameAssets.js';
import { TOWER_COST, ENEMY_PATH, GAME_STATES } from '../utils/Constants.js';
import { UIManager } from '../managers/UIManager.js';
import { WaveSystem } from '../systems/WaveSystem.js';
import { CombatSystem } from '../systems/CombatSystem.js';
import { EnemySystem } from '../systems/EnemySystem.js';
import { EffectSystem } from '../systems/EffectSystem.js';

export class Game {
    constructor() {
        // Core Three.js components
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.clock = new THREE.Clock();
        this.controls = null;

        // Game state
        this.towers = [];
        this.enemies = [];
        this.projectiles = [];
        this.effects = [];
        this.resources = 100;
        this.baseHealth = 100;
        this.gameState = GAME_STATES.IDLE;

        // World and Path
        this.world = null;
        this.enemyPath = ENEMY_PATH; // Using constant

        // Managers and Systems
        this.uiManager = new UIManager();
        this.waveSystem = new WaveSystem(this);
        this.combatSystem = new CombatSystem(this);
        this.enemySystem = new EnemySystem(this);
        this.effectSystem = new EffectSystem(this);

        // Helpers
        this.placementHelper = null;

        this.init();
    }

    init() {
        // Renderer setup
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.getElementById('game-container').appendChild(this.renderer.domElement);

        // Camera setup
        this.camera.position.set(8, 15, 18);
        this.camera.lookAt(8, 0, 8);

        // Controls setup
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.target.set(8, 0, 8);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.1;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.1;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 30;

        // Lighting setup
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(15, 25, 20);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 60;
        directionalLight.shadow.camera.left = -20;
        directionalLight.shadow.camera.right = 20;
        directionalLight.shadow.camera.top = 20;
        directionalLight.shadow.camera.bottom = -20;
        this.scene.add(directionalLight);

        // World setup
        this.world = createGameWorld();
        this.scene.add(this.world);

        // Event listeners
        window.addEventListener('resize', () => this.onWindowResize());
        this.renderer.domElement.addEventListener('mousemove', (event) => this.onMouseMove(event));
        this.renderer.domElement.addEventListener('click', (event) => this.onMouseClick(event));

        // Initial state and UI
        this.uiManager.showLoading(false);
        this.setGameState(GAME_STATES.IDLE); // Set initial state explicitly

        // Start game loop
        this.animate();
    }

    // --- Core Game Loop ---
    animate() {
        requestAnimationFrame(() => this.animate());
        const deltaTime = this.clock.getDelta();

        this.controls.update();

        if (this.gameState !== GAME_STATES.GAME_OVER && this.gameState !== GAME_STATES.VICTORY) {
            this.waveSystem.update(deltaTime);
            this.enemySystem.update(deltaTime);
            this.combatSystem.update(deltaTime);
            this.effectSystem.update(deltaTime);

            // Check for wave completion
            if (this.waveSystem.isWaveComplete()) {
                 this.setGameState(GAME_STATES.WAVE_COMPLETE);
                 if (this.waveSystem.isAllWavesComplete()) {
                     this.setGameState(GAME_STATES.VICTORY);
                 }
            }
        }

        this.renderer.render(this.scene, this.camera);
    }

    // --- Game State Management ---
    setGameState(newState) {
        if (this.gameState === newState) return;
        console.log(`Game State Change: ${this.gameState} -> ${newState}`);
        this.gameState = newState;

        if (newState === GAME_STATES.GAME_OVER) alert("Game Over!");
        else if (newState === GAME_STATES.VICTORY) alert("Victory!");

        this.updateUI(); // Update UI whenever state changes
    }

    // --- UI Update ---
    updateUI() {
        this.uiManager.updateUI(
            this.gameState, 
            this.resources, 
            this.baseHealth, 
            this.waveSystem.getCurrentWaveNumber(),
            WAVE_CONFIG
        );

        // Update wave progress if a wave is active
        if (this.gameState === GAME_STATES.WAVE_SPAWNING || this.gameState === GAME_STATES.WAVE_ACTIVE) {
            const totalEnemies = this.waveSystem.getTotalEnemiesInWave();
            const remainingEnemies = this.waveSystem.remainingEnemies.length + this.enemies.length;
            this.uiManager.updateWaveProgress(remainingEnemies, totalEnemies);
        }
    }

    // --- Event Handlers ---
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onMouseClick(event) {
        const mouse = new THREE.Vector2(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        );
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);
        const intersects = raycaster.intersectObjects(this.world.children, true);

        if (intersects.length > 0) {
            let clickedObject = intersects[0].object;
            while (clickedObject.parent && clickedObject.userData.type !== 'tile') {
                clickedObject = clickedObject.parent;
            }
            const tile = clickedObject;

            if (tile && tile.userData.type === 'tile' && tile.userData.buildable) {
                if (this.resources >= TOWER_COST) {
                    const tower = createBasicTower();
                    tower.position.copy(tile.position);
                    tower.position.y = 0.2;
                    this.scene.add(tower);
                    this.towers.push(tower);
                    this.resources -= TOWER_COST;
                    this.updateUI();
                    tile.userData.buildable = false;
                    if (this.placementHelper) this.placementHelper.visible = false;
                } else {
                    console.log("Not enough resources!");
                }
            }
        }
    }

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
                    this.placementHelper = createBasicTower();
                    this.placementHelper.traverse((child) => {
                        if (child.isMesh) {
                            child.material = child.material.clone();
                            child.material.transparent = true;
                            child.material.opacity = 0.5;
                        }
                    });
                    if (this.placementHelper.userData.rangeIndicator) {
                         this.placementHelper.userData.rangeIndicator.visible = true;
                         this.placementHelper.userData.rangeIndicator.material.opacity = 0.1;
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

    // --- Entity Management ---
    spawnEnemy(enemyType = 'basic') {
        // Create enemy based on type
        let enemy;
        switch (enemyType) {
            case 'fast':
                enemy = createFastEnemy();
                break;
            case 'tank':
                enemy = createTankEnemy();
                break;
            case 'flying':
                enemy = createFlyingEnemy();
                break;
            case 'swarm':
                enemy = createSwarmEnemy();
                break;
            case 'boss':
                enemy = createBossEnemy();
                break;
            default:
                enemy = createBasicEnemy();
        }

        // Set initial position and path data
        enemy.position.copy(this.enemyPath[0]);
        enemy.userData.pathIndex = 0;

        // For flying enemies, add hover height to Y position
        if (enemy.userData.flying) {
            enemy.position.y += enemy.userData.hoverHeight || 0;
        }

        // Ensure health bar is visible and properly scaled
        if (enemy.userData.healthBar) {
            enemy.userData.healthBar.group.visible = true;
            this.updateEnemyHealthBar(enemy);
        }

        // Add special behaviors for swarm enemies
        if (enemy.userData.enemyType === 'swarm' && enemy.userData.units) {
            enemy.userData.lastBobUpdate = 0;
        }

        this.scene.add(enemy);
        this.enemies.push(enemy);
    }

    removeEnemy(enemy, index, useEffect = false) {
        if (useEffect) {
            const effect = createDeathEffect(enemy.position);
            this.scene.add(effect);
            this.effects.push(effect);
        }
        this.scene.remove(enemy);
        if (index >= 0 && index < this.enemies.length) {
             this.enemies.splice(index, 1);
        } else {
             console.warn("Attempted to remove enemy with invalid index", index);
        }
    }

    removeProjectile(projectile, index) {
        this.scene.remove(projectile);
         if (index >= 0 && index < this.projectiles.length) {
            this.projectiles.splice(index, 1);
        } else {
             console.warn("Attempted to remove projectile with invalid index", index);
        }
    }

    // --- Helper Methods ---
    updateEnemyHealthBar(enemy) {
        if (!enemy.userData.healthBar || !enemy.userData.healthBar.group) return;

        const healthPercent = Math.max(0, enemy.userData.health / enemy.userData.maxHealth);
        const healthBar = enemy.userData.healthBar;

        healthBar.foreground.scale.x = healthPercent;
        healthBar.foreground.position.x = - (healthBar.maxWidth * (1 - healthPercent)) / 2;

        healthBar.group.visible = healthPercent > 0;
    }
}
