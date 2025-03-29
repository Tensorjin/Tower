export class EffectSystem {
    constructor(game) {
        this.game = game; // Reference to the main game class
    }

    update(deltaTime) {
        for (let i = this.game.effects.length - 1; i >= 0; i--) {
            const effect = this.game.effects[i];
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
                this.game.scene.remove(effect);
                this.game.effects.splice(i, 1);
            }
        }
    }
}
