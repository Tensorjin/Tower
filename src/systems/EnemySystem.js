import * as THREE from 'three';
import { ENEMY_PATH, GAME_STATES } from '../utils/Constants.js';

export class EnemySystem {
    constructor(game) {
        this.game = game; // Reference to the main game class
        this.enemyPath = ENEMY_PATH;
        this.time = 0; // Track time for animations
    }

    updateSpecialBehaviors(enemy, deltaTime) {
        this.time += deltaTime;
        
        switch (enemy.userData.enemyType) {
            case 'swarm':
                if (enemy.userData.units) {
                    for (const unit of enemy.userData.units) {
                        if (!unit.userData.originalPos) continue;
                        
                        const bobSpeed = unit.userData.bobSpeed || 1;
                        const bobHeight = unit.userData.bobHeight || 0.1;
                        const bobOffset = unit.userData.bobOffset || 0;
                        
                        // Calculate new Y position based on sine wave
                        const newY = unit.userData.originalPos.y + 
                                   Math.sin(this.time * bobSpeed + bobOffset) * bobHeight;
                        unit.position.y = newY;
                    }
                }
                break;
                
            case 'flying':
                const baseY = this.enemyPath[enemy.userData.pathIndex].y;
                const hoverHeight = enemy.userData.hoverHeight || 2.0;
                const floatAmount = Math.sin(this.time * 1.5) * 0.1;
                enemy.position.y = baseY + hoverHeight + floatAmount;
                break;

            case 'tank':
                // Tanks maintain steady height and slow turning
                if (enemy.userData.targetRotation) {
                    const rotDiff = enemy.userData.targetRotation - enemy.rotation.y;
                    enemy.rotation.y += rotDiff * deltaTime * 2; // Slower rotation
                }
                break;

            case 'boss':
                // Boss special effects (pulsing glow, etc.)
                const pulseIntensity = (Math.sin(this.time * 2) + 1) * 0.3;
                enemy.traverse(child => {
                    if (child.isMesh && child.material.emissive) {
                        child.material.emissiveIntensity = pulseIntensity;
                    }
                });
                break;
        }
    }

    update(deltaTime) {
        for (let i = this.game.enemies.length - 1; i >= 0; i--) {
            const enemy = this.game.enemies[i];
            
            try {
                // Skip invalid enemies
                if (!enemy || !enemy.userData || typeof enemy.userData.pathIndex !== 'number') {
                    console.warn('Invalid enemy found, removing:', enemy);
                    this.game.removeEnemy(enemy, i);
                    continue;
                }

                // Check if enemy reached the end
                if (enemy.userData.pathIndex >= this.enemyPath.length - 1) {
                    const damage = enemy.userData.damage || 10; // Use enemy's damage value or default
                    this.game.baseHealth -= damage;
                    this.game.updateUI();
                    this.game.removeEnemy(enemy, i);
                    if (this.game.baseHealth <= 0 && this.game.gameState !== GAME_STATES.GAME_OVER) {
                        this.game.setGameState(GAME_STATES.GAME_OVER);
                    }
                    continue;
                }

                // Get next path point
                const targetPoint = this.enemyPath[enemy.userData.pathIndex + 1];
                const direction = targetPoint.clone().sub(enemy.position).normalize();
                const distanceToTarget = enemy.position.distanceTo(targetPoint);
                const moveDistance = enemy.userData.speed * deltaTime;

                // Move enemy
                if (moveDistance >= distanceToTarget) {
                    enemy.position.copy(targetPoint);
                    enemy.userData.pathIndex++;
                } else {
                    const targetAngle = Math.atan2(direction.x, direction.z);
                    const currentAngle = enemy.rotation.y;
                    let angleDiff = targetAngle - currentAngle;
                    
                    // Normalize angle difference
                    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
                    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                    
                    // Smooth rotation
                    const rotationSpeed = 5.0;
                    enemy.rotation.y += angleDiff * deltaTime * rotationSpeed;

                    // Move position
                    direction.multiplyScalar(moveDistance);
                    enemy.position.add(direction);
                }

                // Apply special behaviors
                this.updateSpecialBehaviors(enemy, deltaTime);

                // Update health bar orientation
                if (enemy.userData.healthBar?.group) {
                    enemy.userData.healthBar.group.quaternion.copy(this.game.camera.quaternion);
                }
            } catch (error) {
                console.error('Error updating enemy:', error);
                // Remove problematic enemy if there's an error
                this.game.removeEnemy(enemy, i);
            }
        }
    }
}
