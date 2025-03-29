import * as THREE from 'three';
import { createGameWorld, createEnemy, createBasicTower } from '../assets/GameAssets.js';

export class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.clock = new THREE.Clock();
        
        this.init();
    }
    
    init() {
        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        document.getElementById('game-container').appendChild(this.renderer.domElement);
        
        // Setup camera
        this.camera.position.set(10, 10, 10);
        this.camera.lookAt(0, 0, 0);
        
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
        this.resources = 100;
        this.baseHealth = 100;
        this.currentWave = 1;
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Add click event listener for tower placement
        this.renderer.domElement.addEventListener('click', (event) => this.onMouseClick(event));
        
        // Hide loading screen
        document.getElementById('loading-screen').style.display = 'none';
        
        // Start game loop
        this.animate();
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
            const tile = intersects[0].object.parent;
            if (tile.userData.buildable && this.resources >= 50) {
                // Place tower
                const tower = createBasicTower();
                tower.position.copy(tile.position);
                tower.position.y = 0.2; // Adjust height
                this.scene.add(tower);
                this.towers.push(tower);
                
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
        // Position at start tile
        enemy.position.set(4, 0.5, 0); // Adjust based on your map
        this.scene.add(enemy);
        this.enemies.push(enemy);
    }
    
    updateEnemies(deltaTime) {
        for (const enemy of this.enemies) {
            // Simple movement along path
            enemy.position.z += deltaTime * 2; // Move forward
        }
    }
    
    updateTowers(deltaTime) {
        for (const tower of this.towers) {
            // Simple rotation for now
            tower.userData.turret.rotation.y += deltaTime;
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const deltaTime = this.clock.getDelta();
        
        // Update game objects
        this.updateEnemies(deltaTime);
        this.updateTowers(deltaTime);
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
}
