import * as THREE from 'three';
import { createProjectile } from '../assets/GameAssets.js';

export class CombatSystem {
    constructor(game) {
        this.game = game; // Reference to the main game class
    }

    update(deltaTime) {
        this.updateTowers(deltaTime);
        this.updateProjectiles(deltaTime);
    }

    updateTowers(deltaTime) {
        for (const tower of this.game.towers) {
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

                for (const enemy of this.game.enemies) {
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

        this.game.scene.add(projectile);
        this.game.projectiles.push(projectile); // Add to game's projectile list
    }

    updateProjectiles(deltaTime) {
        for (let i = this.game.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.game.projectiles[i];
            const target = projectile.userData.target;

            // If target is gone, remove projectile
            if (!target || !this.game.enemies.includes(target)) {
                this.game.removeProjectile(projectile, i); // Use game's remove function
                continue;
            }

            // Move projectile towards target
            const direction = target.position.clone().sub(projectile.position).normalize();
            const moveDistance = projectile.userData.speed * deltaTime;
            projectile.position.add(direction.multiplyScalar(moveDistance));

            // Check for collision
            if (projectile.position.distanceTo(target.position) < 0.5) { // Collision threshold
                target.userData.health -= projectile.userData.damage;
                this.game.updateEnemyHealthBar(target); // Use game's health bar update

                // Check if enemy died
                if (target.userData.health <= 0) {
                    this.game.resources += 10; // Grant resources via game reference
                    this.game.updateUI(); // Update UI via game reference

                    // Find the enemy index before removing
                    const enemyIndex = this.game.enemies.indexOf(target);
                    if (enemyIndex !== -1) {
                        this.game.removeEnemy(target, enemyIndex, true); // Use game's remove function
                    }
                }

                this.game.removeProjectile(projectile, i); // Use game's remove function
            }
        }
    }
}
