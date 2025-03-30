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
        this.uiManager = new UIManager();
        this.uiManager.showLoading(true, "Starting game initialization...");

        // Initialize the game with error handling
        this.init().catch(error => {
            console.error('Game initialization failed:', error);
            this.uiManager.showError(`Failed to initialize game: ${error.message}`);
            throw error; // Re-throw to trigger global error handler
        });
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async init() {
        try {
            this.uiManager.updateLoadingProgress("Initializing 3D scene...", "Setting up game environment");
            this.initializeScene();
            await this.delay(300);

            this.uiManager.updateLoadingProgress("Initializing game systems...", "Loading game mechanics");
            await this.initializeManagers();
            await this.delay(300);

            this.uiManager.updateLoadingProgress("Setting up game world...", "Creating game world");
            this.setupWorld();
            await this.delay(300);

            this.uiManager.updateLoadingProgress("Initializing game state...", "Preparing for gameplay");
            this.gameState = GAME_STATES.IDLE;
            this.enemies = [];
            this.projectiles = [];
            this.effects = [];
            await this.delay(300);

            this.uiManager.updateLoadingProgress("Starting game engine...", "Almost ready!");
            this.animate();
            await this.delay(500);

            this.uiManager.updateLoadingProgress("Game ready!", "Loading complete");
            await this.delay(300);
            this.uiManager.showLoading(false);
        } catch (error) {
            console.error('Error during game initialization:', error);
            throw error;
        }
    }

    initializeScene() {
        // Core Three.js setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        const container = document.getElementById('game-container');
        if (!container) {
            throw new Error('Game container not found');
        }
        container.appendChild(this.renderer.domElement);

        this.setupCamera();
        this.setupLighting();
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

    async initializeManagers() {
        try {
            // Initialize managers
            this.resourceManager = new ResourceManager(this);
            this.inputManager = new InputManager(this);
            this.towerManager = new TowerManager(this);

            // Initialize systems
            this.waveSystem = new WaveSystem(this);
            this.combatSystem = new CombatSystem(this);
            this.enemySystem = new EnemySystem(this);
            this.effectSystem = new EffectSystem(this);

            // Set initial game state
            this.setGameState(GAME_STATES.IDLE);
        } catch (error) {
            console.error('Failed to initialize managers:', error);
            throw error;
        }
    }

    setupWorld() {
        this.world = createGameWorld();
        this.scene.add(this.world);
        this.enemyPath = ENEMY_PATH;
    }

    animate() {
        if (!this.renderer) return; // Guard against animation after cleanup

        requestAnimationFrame(() => this.animate());
        const deltaTime = 1/60; // Fixed time step

        try {
            // Update controls
            this.controls.update();

            // Update game state
            if (this.gameState !== GAME_STATES.GAME_OVER && 
                this.gameState !== GAME_STATES.VICTORY) {
                this.updateGameSystems(deltaTime);
                this.checkWaveCompletion();
            }

            // Render scene
            this.renderer.render(this.scene, this.camera);
        } catch (error) {
            console.error('Error in animation loop:', error);
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
            currentWave: this.waveSystem.getCurrentWaveNumber(),
            activeEnemies: this.enemies.length,
            remainingSpawns: this.waveSystem.remainingEnemies.length,
            ...this.resourceManager.getStats()
        });

        this.gameState = newState;
        this.updateUI();
    }

    updateUI() {
        try {
            this.uiManager.updateUI(
                this.gameState,
                this.resourceManager.getStats(),
                this.waveSystem.getCurrentWaveNumber(),
                this.waveSystem.waveConfig
            );
        } catch (error) {
            console.error('Error updating UI:', error);
        }
    }

    cleanup() {
        // Stop animation loop
        this.renderer = null;

        // Clean up managers
        this.inputManager?.cleanup();
        this.towerManager?.cleanup();

        // Clean up Three.js resources
        this.scene?.clear();
        this.renderer?.dispose();
    }
}
