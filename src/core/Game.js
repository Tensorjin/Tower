import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createGameWorld } from '../assets/GameAssets.js';
import { ENEMY_PATH, GAME_STATES } from '../utils/Constants.js';

// Import managers and systems
import { UIManager } from '../managers/UIManager.js';
import { InputManager } from '../managers/InputManager.js';
import { TowerManager } from '../managers/TowerManager.js';
import { ResourceManager } from '../managers/ResourceManager.js';
import { WaveSystem } from '../systems/WaveSystem.js';
import { CombatSystem } from '../systems/CombatSystem.js';
import { EnemySystem } from '../systems/EnemySystem.js';
import { EffectSystem } from '../systems/EffectSystem.js';

export class Game {
    constructor() {
        this.uiManager = new UIManager(); // Initialize UI Manager first
        this.uiManager.showLoading(true, "Starting game initialization...");

        try {
            this.initializeScene();
            this.initializeManagersAndSystems(); // Initialize managers and systems synchronously
            this.setupWorld();

            // Initialize game state
            this.gameState = GAME_STATES.IDLE;
            this.enemies = [];
            this.projectiles = [];
            this.effects = [];

            // Set initial UI state after everything is initialized
            this.setGameState(GAME_STATES.IDLE); 

            // Start game loop
            this.animate();

            // Hide loading screen after successful initialization
            this.uiManager.showLoading(false);
            console.log("Game initialization complete.");

        } catch (error) {
            console.error('Game initialization failed:', error);
            this.uiManager.showError(`Failed to initialize game: ${error.message}`);
            // Optionally re-throw or handle cleanup
        }
    }

    initializeScene() {
        console.log('Initializing scene...');
        // Core Three.js setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        const container = document.getElementById('game-container');
        if (!container) throw new Error('Game container not found');
        container.appendChild(this.renderer.domElement);

        this.setupCamera();
        this.setupLighting();
        console.log('Scene initialized.');
    }

    setupCamera() {
        this.camera.position.set(8, 15, 18);
        this.camera.lookAt(8, 0, 8);
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.target.set(8, 0, 8);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.1;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.1;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 30;
    }

    setupLighting() {
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
    }

    initializeManagersAndSystems() {
        console.log('Initializing managers and systems...');
        try {
            // Initialize managers
            this.resourceManager = new ResourceManager(this);
            this.inputManager = new InputManager(this); // Depends on renderer
            this.towerManager = new TowerManager(this);

            // Initialize systems
            this.waveSystem = new WaveSystem(this);
            this.combatSystem = new CombatSystem(this);
            this.enemySystem = new EnemySystem(this);
            this.effectSystem = new EffectSystem(this);
            console.log('Managers and systems initialized.');
        } catch (error) {
            console.error('Failed to initialize managers/systems:', error);
            throw error; // Propagate error
        }
    }

    setupWorld() {
        console.log('Setting up world...');
        this.world = createGameWorld();
        this.scene.add(this.world);
        this.enemyPath = ENEMY_PATH;
        console.log('World setup complete.');
    }

    animate() {
        if (!this.renderer) return; 

        requestAnimationFrame(() => this.animate());
        const deltaTime = 1/60; 

        try {
            this.controls.update();

            if (this.gameState !== GAME_STATES.GAME_OVER && 
                this.gameState !== GAME_STATES.VICTORY) {
                this.updateGameSystems(deltaTime);
                this.checkWaveCompletion();
            }

            this.renderer.render(this.scene, this.camera);
        } catch (error) {
            console.error('Error in animation loop:', error);
            // Consider pausing the game or showing an error state
        }
    }

    updateGameSystems(deltaTime) {
        this.waveSystem.update(deltaTime);
        this.enemySystem.update(deltaTime);
        this.towerManager.update(deltaTime);
        this.combatSystem.update(deltaTime);
        this.effectSystem.update(deltaTime);
    }

    checkWaveCompletion() {
        if (this.waveSystem.isWaveComplete()) {
            this.setGameState(GAME_STATES.WAVE_COMPLETE);
            if (this.waveSystem.isAllWavesComplete()) {
                this.setGameState(GAME_STATES.VICTORY);
            }
        }
    }

    setGameState(newState) {
        if (this.gameState === newState) return;

        console.log('Game State Change:', {
            from: this.gameState,
            to: newState,
            currentWave: this.waveSystem?.getCurrentWaveNumber() ?? 0, // Handle potential undefined
            activeEnemies: this.enemies?.length ?? 0,
            remainingSpawns: this.waveSystem?.remainingEnemies?.length ?? 0,
            ...(this.resourceManager?.getStats() ?? { resources: 'N/A', baseHealth: 'N/A', score: 'N/A' })
        });

        this.gameState = newState;
        this.updateUI(); // Update UI after state change
    }

    updateUI() {
        try {
            // Ensure managers are initialized before updating UI
            if (this.uiManager && this.resourceManager && this.waveSystem) {
                this.uiManager.updateUI(
                    this.gameState,
                    this.resourceManager.getStats(),
                    this.waveSystem.getCurrentWaveNumber(),
                    this.waveSystem.waveConfig
                );
            } else {
                console.warn("Attempted to update UI before managers were ready.");
            }
        } catch (error) {
            console.error('Error updating UI:', error);
        }
    }

    // --- Event Handlers (Keep in Game or move to InputManager if preferred) ---
     onWindowResize() {
        if (!this.camera || !this.renderer) return;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // --- Cleanup ---
    cleanup() {
        console.log("Cleaning up game resources...");
        // Stop animation loop
        // How to stop requestAnimationFrame? Set a flag.
        this.gameState = GAME_STATES.GAME_OVER; // Prevent further updates

        // Clean up managers/systems that hold resources or listeners
        this.inputManager?.cleanup(); 
        this.towerManager?.cleanup(); 

        // Dispose Three.js resources
        this.scene?.traverse(object => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
        this.scene?.clear();
        this.renderer?.dispose();
        this.renderer = null; // Allow garbage collection
        console.log("Cleanup complete.");
    }
}
