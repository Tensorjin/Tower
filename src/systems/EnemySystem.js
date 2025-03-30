import * as THREE from 'three';
import { ENEMY_PATH, GAME_STATES } from '../utils/Constants.js';

export class EnemySystem {
    constructor(game) {
        this.game = game; // Reference to the main game class
        this.enemyPath = ENEMY_PATH;
    }

    update(deltaTime) {
        for (let i = this.game.enemies.length - 1; i >= 0; i--) {
            const enemy = this.game.enemies[i];

            // Check if enemy reached the end
            if (enemy.userData.pathIndex >= this.enemyPath.length - 1) {
                this.game.baseHealth -= 10; // Reduce base health via game reference
                this.game.updateUI(); // Update UI via game reference
                this.game.removeEnemy(enemy, i); // Use game's remove function
                if (this.game.baseHealth <= 0 && this.game.gameState !== GAME_STATES.GAME_OVER) {
                    this.game.setGameState(GAME_STATES.GAME_OVER); // Update game state via game reference
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
                // --- Smooth Rotation using atan2 ---
                const targetAngle = Math.atan2(direction.x, direction.z);
                const currentAngle = enemy.rotation.y;
                let angleDiff = targetAngle - currentAngle;
                while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
                while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                enemy.rotation.y += angleDiff * deltaTime * 5.0; // Adjust rotation speed as needed
                // --- End Smooth Rotation ---

                enemy.position.add(direction.multiplyScalar(moveDistance));
            }

            // Special enemy type behaviors
            switch (enemy.userData.enemyType) {
                case 'swarm':
                    // Animate individual swarm units
                    if (enemy.userData.units) {
                        const time = Date.now() * 0.001; // Current time in seconds
                        for (const unit of enemy.userData.units) {
                            const originalPos = unit.userData.originalPos;
                            const bobSpeed = unit.userData.bobSpeed;
                            const bobHeight = unit.userData.bobHeight;
                            const bobOffset = unit.userData.bobOffset || 0;
                            
                            // Calculate new Y position based on sine wave
                            const newY = originalPos.y + Math.sin(time * bobSpeed + bobOffset) * bobHeight;
                            unit.position.y = newY;
                        }
                    }
                    break;
                    
                case 'flying':
                    // Maintain hover height and add subtle floating motion
                    const hoverHeight = enemy.userData.hoverHeight || 2.0;
                    const time = Date.now() * 0.001;
                    enemy.position.y = this.enemyPath[enemy.userData.pathIndex].y + 
                                    hoverHeight + 
                                    Math.sin(time * 1.5) * 0.1; // Subtle up/down motion
                    break;
            }

            // Make health bar face camera (billboarding)
            if (enemy.userData.healthBar && enemy.userData.healthBar.group) {
                enemy.userData.healthBar.group.quaternion.copy(this.game.camera.quaternion);
            }
        }
    }
}
