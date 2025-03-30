import { TOWER_COST, GAME_STATES } from '../utils/Constants.js';

export class UIManager {
    constructor() {
        this.resourceCountElement = document.getElementById('resource-count');
        this.healthCountElement = document.getElementById('health-count');
        this.waveNumberElement = document.getElementById('wave-number');
        this.towerCostElement = document.getElementById('tower-cost');
        this.startWaveButton = document.getElementById('start-wave');
        this.waveCompositionElement = document.getElementById('wave-composition');
        this.nextWaveCompositionElement = document.getElementById('next-wave-composition');
        this.waveProgressElement = document.getElementById('wave-progress');
    }

    // Create an enemy type indicator
    createEnemyTypeIndicator(type, count) {
        const enemyType = document.createElement('div');
        enemyType.className = 'enemy-type';
        
        const icon = document.createElement('div');
        icon.className = `enemy-type-icon enemy-${type}`;
        
        const text = document.createElement('span');
        text.textContent = `${count}x ${type.charAt(0).toUpperCase() + type.slice(1)}`;
        
        enemyType.appendChild(icon);
        enemyType.appendChild(text);
        return enemyType;
    }

    // Update the wave composition display
    updateWaveComposition(currentWave, nextWave) {
        // Clear existing content
        this.waveCompositionElement.innerHTML = '';
        this.nextWaveCompositionElement.innerHTML = '';

        // Update current wave composition
        if (currentWave && currentWave.enemies) {
            currentWave.enemies.forEach(enemy => {
                this.waveCompositionElement.appendChild(
                    this.createEnemyTypeIndicator(enemy.type, enemy.count)
                );
            });
        }

        // Update next wave preview
        if (nextWave && nextWave.enemies) {
            nextWave.enemies.forEach(enemy => {
                this.nextWaveCompositionElement.appendChild(
                    this.createEnemyTypeIndicator(enemy.type, enemy.count)
                );
            });
        }
    }

    // Update wave progress bar
    updateWaveProgress(current, total) {
        const progress = total > 0 ? (1 - current / total) * 100 : 0;
        this.waveProgressElement.style.width = `${progress}%`;
    }

    updateUI(gameState, resources, baseHealth, currentWave, waveData) {
        if (!this.resourceCountElement || !this.healthCountElement || !this.waveNumberElement || !this.towerCostElement || !this.startWaveButton) {
            console.error("UI elements not found!");
            return;
        }

        // Update basic stats
        this.resourceCountElement.textContent = resources;
        this.healthCountElement.textContent = baseHealth;
        this.waveNumberElement.textContent = currentWave > 0 ? currentWave : '-';
        this.towerCostElement.textContent = TOWER_COST;

        // Update wave button state
        if (gameState === GAME_STATES.IDLE || gameState === GAME_STATES.WAVE_COMPLETE) {
            this.startWaveButton.disabled = false;
            this.startWaveButton.textContent = `Start Wave ${currentWave + 1}`;
            
            // Show next wave composition
            if (waveData) {
                const currentWaveData = waveData[currentWave - 1];
                const nextWaveData = waveData[currentWave];
                this.updateWaveComposition(currentWaveData, nextWaveData);
            }
        } else {
            this.startWaveButton.disabled = true;
            this.startWaveButton.textContent = 'Wave in Progress...';
        }

        if (gameState === GAME_STATES.VICTORY) {
            this.startWaveButton.textContent = 'You Win!';
            this.startWaveButton.disabled = true;
            this.nextWaveCompositionElement.innerHTML = '';
        } else if (gameState === GAME_STATES.GAME_OVER) {
            this.startWaveButton.textContent = 'Game Over!';
            this.startWaveButton.disabled = true;
            this.nextWaveCompositionElement.innerHTML = '';
        }
    }

    showLoading(visible) {
         const loadingScreen = document.getElementById('loading-screen');
         if (loadingScreen) {
             loadingScreen.style.display = visible ? 'flex' : 'none';
         }
    }
}
