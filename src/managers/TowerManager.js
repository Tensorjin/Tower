import { TOWER_COST } from '../utils/Constants.js';
import { createBasicTower } from '../assets/GameAssets.js';

export class TowerManager {
    constructor(game) {
        this.game = game;
        this.towers = [];
    }

    tryBuildTower(tile) {
        if (!tile || !tile.userData.buildable) {
            console.warn('Invalid tile for tower placement');
            return false;
        }

        if (this.game.resources < TOWER_COST) {
            console.log("Not enough resources!");
            return false;
        }

        const tower = this.buildTower(tile);
        if (tower) {
            this.game.resources -= TOWER_COST;
            this.game.updateUI();
            tile.userData.buildable = false;
            return true;
        }
        return false;
    }

    buildTower(tile) {
        try {
            const tower = createBasicTower();
            tower.position.copy(tile.position);
            tower.position.y = 0.2;
            this.game.scene.add(tower);
            this.towers.push(tower);
            return tower;
        } catch (error) {
            console.error('Error building tower:', error);
            return null;
        }
    }

    update(deltaTime) {
        // Update all towers (for animations, targeting, etc.)
        for (const tower of this.towers) {
            this.updateTower(tower, deltaTime);
        }
    }

    updateTower(tower, deltaTime) {
        if (!tower.userData.turret) return;

        // Find nearest enemy
        let nearestEnemy = null;
        let nearestDistance = Infinity;

        for (const enemy of this.game.enemies) {
            const distance = tower.position.distanceTo(enemy.position);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestEnemy = enemy;
            }
        }

        // Rotate turret to face enemy
        if (nearestEnemy && nearestDistance < 5) { // tower range
            const direction = new THREE.Vector3()
                .subVectors(nearestEnemy.position, tower.position)
                .normalize();
            const angle = Math.atan2(direction.x, direction.z);
            tower.userData.turret.rotation.y = angle;
        }
    }

    removeTower(tower, index) {
        if (tower) {
            this.game.scene.remove(tower);
            if (index >= 0 && index < this.towers.length) {
                this.towers.splice(index, 1);
            }
        }
    }

    cleanup() {
        // Remove all towers from the scene
        for (const tower of this.towers) {
            this.game.scene.remove(tower);
        }
        this.towers = [];
    }
}
