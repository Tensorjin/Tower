import { GAME_STATES } from '../utils/Constants.js';

export class ResourceManager {
    constructor(game) {
        this.game = game;
        this.resources = 100;  // Starting resources
        this.baseHealth = 100; // Starting health
        this.score = 0;
    }

    addResources(amount) {
        this.resources += amount;
        this.game.updateUI();
    }

    spendResources(amount) {
        if (this.resources >= amount) {
            this.resources -= amount;
            this.game.updateUI();
            return true;
        }
        return false;
    }

    hasEnoughResources(amount) {
        return this.resources >= amount;
    }

    damageBase(amount) {
        this.baseHealth = Math.max(0, this.baseHealth - amount);
        this.game.updateUI();
        
        if (this.baseHealth <= 0) {
            this.game.setGameState(GAME_STATES.GAME_OVER);
        }
    }

    addScore(amount) {
        this.score += amount;
        this.game.updateUI();
    }

    getStats() {
        return {
            resources: this.resources,
            baseHealth: this.baseHealth,
            score: this.score
        };
    }

    reset() {
        this.resources = 100;
        this.baseHealth = 100;
        this.score = 0;
        this.game.updateUI();
    }
}
