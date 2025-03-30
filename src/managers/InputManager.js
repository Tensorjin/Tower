import * as THREE from 'three';
import { TOWER_COST } from '../utils/Constants.js';
import { createBasicTower } from '../assets/GameAssets.js';

export class InputManager {
    constructor(game) {
        this.game = game;
        this.placementHelper = null;
        
        // Bind event handlers
        window.addEventListener('resize', () => this.onWindowResize());
        this.game.renderer.domElement.addEventListener('mousemove', (event) => this.onMouseMove(event));
        this.game.renderer.domElement.addEventListener('click', (event) => this.onMouseClick(event));
    }

    onWindowResize() {
        this.game.camera.aspect = window.innerWidth / window.innerHeight;
        this.game.camera.updateProjectionMatrix();
        this.game.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onMouseClick(event) {
        const mouse = new THREE.Vector2(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        );
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.game.camera);
        const intersects = raycaster.intersectObjects(this.game.world.children, true);

        if (intersects.length > 0) {
            let clickedObject = intersects[0].object;
            while (clickedObject.parent && clickedObject.userData.type !== 'tile') {
                clickedObject = clickedObject.parent;
            }
            const tile = clickedObject;

            if (tile && tile.userData.type === 'tile' && tile.userData.buildable) {
                this.game.towerManager.tryBuildTower(tile);
            }
        }
    }

    onMouseMove(event) {
        const mouse = new THREE.Vector2(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        );
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.game.camera);
        const intersects = raycaster.intersectObjects(this.game.world.children, true);

        if (intersects.length > 0) {
            let intersectedObject = intersects[0].object;
            while (intersectedObject.parent && intersectedObject.userData.type !== 'tile') {
                intersectedObject = intersectedObject.parent;
            }
            const tile = intersectedObject;

            if (tile && tile.userData.type === 'tile' && tile.userData.buildable) {
                this.showPlacementHelper(tile);
            } else {
                this.hidePlacementHelper();
            }
        } else {
            this.hidePlacementHelper();
        }
    }

    showPlacementHelper(tile) {
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
            this.game.scene.add(this.placementHelper);
        }
        this.placementHelper.position.copy(tile.position);
        this.placementHelper.position.y = 0.2;
        this.placementHelper.visible = true;
    }

    hidePlacementHelper() {
        if (this.placementHelper) {
            this.placementHelper.visible = false;
        }
    }

    cleanup() {
        window.removeEventListener('resize', this.onWindowResize);
        this.game.renderer.domElement.removeEventListener('mousemove', this.onMouseMove);
        this.game.renderer.domElement.removeEventListener('click', this.onMouseClick);
        if (this.placementHelper) {
            this.game.scene.remove(this.placementHelper);
            this.placementHelper = null;
        }
    }
}
