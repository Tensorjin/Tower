import { TOWER_COST, GAME_STATES } from '../utils/Constants.js';

export class UIManager {
    constructor() {
        this.resourceCountElement = document.getElementById('resource-count');
        this.healthCountElement = document.getElementById('health-count');
        this.waveNumberElement = document.getElementById('wave-number');
        this.towerCostElement = document.getElementById('tower-cost');
        this.startWaveButton = document.getElementById('start-wave');
    }

    updateUI(gameState, resources, baseHealth, currentWave) {
        if (!this.resourceCountElement || !this.healthCountElement || !this.waveNumberElement || !this.towerCostElement || !this.startWaveButton) {
            console.error("UI elements not found!");
            return;
        }

        this.resourceCountElement.textContent = resources;
        this.healthCountElement.textContent = baseHealth;
        this.waveNumberElement.textContent = currentWave > 0 ? currentWave : '-';
        this.towerCostElement.textContent = TOWER_COST;

        if (gameState === GAME_STATES.IDLE || gameState === GAME_STATES.WAVE_COMPLETE) {
            this.startWaveButton.disabled = false;
            this.startWaveButton.textContent = `Start Wave ${currentWave + 1}`;
        } else {
            this.startWaveButton.disabled = true;
            this.startWaveButton.textContent = 'Wave in Progress...';
        }

        if (gameState === GAME_STATES.VICTORY) {
             this.startWaveButton.textContent = 'You Win!';
             this.startWaveButton.disabled = true;
        } else if (gameState === GAME_STATES.GAME_OVER) {
             this.startWaveButton.textContent = 'Game Over!';
             this.startWaveButton.disabled = true;
        }
    }

    showLoading(visible) {
         const loadingScreen = document.getElementById('loading-screen');
         if (loadingScreen) {
             loadingScreen.style.display = visible ? 'flex' : 'none';
         }
    }
}
