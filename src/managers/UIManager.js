import { TOWER_COST, GAME_STATES } from '../utils/Constants.js';

export class UIManager {
    constructor() {
        console.log('Initializing UI Manager...');
        this.initializeUIElements();
    }

    initializeUIElements() {
        console.log('Setting up UI elements...');
        try {
            // Initialize or re-initialize UI elements
            this.resourceCountElement = document.getElementById('resource-count');
            this.healthCountElement = document.getElementById('health-count');
            this.waveNumberElement = document.getElementById('wave-number');
            this.towerCostElement = document.getElementById('tower-cost');
            this.startWaveButton = document.getElementById('start-wave');
            this.waveCompositionElement = document.getElementById('wave-composition');
            this.nextWaveCompositionElement = document.getElementById('next-wave-composition');
            this.waveProgressElement = document.getElementById('wave-progress');
            this.loadingScreen = document.getElementById('loading-screen');
            this.loadingProgress = document.querySelector('.loading-progress');
            this.loadingText = document.querySelector('.loading-text');

            // Check if any required elements are missing
            const elements = [
                { name: 'resource-count', el: this.resourceCountElement },
                { name: 'health-count', el: this.healthCountElement },
                { name: 'wave-number', el: this.waveNumberElement },
                { name: 'tower-cost', el: this.towerCostElement },
                { name: 'start-wave', el: this.startWaveButton },
                { name: 'wave-composition', el: this.waveCompositionElement },
                { name: 'next-wave-composition', el: this.nextWaveCompositionElement },
                { name: 'wave-progress', el: this.waveProgressElement },
                { name: 'loading-screen', el: this.loadingScreen },
                { name: 'loading-progress', el: this.loadingProgress },
                { name: 'loading-text', el: this.loadingText }
            ];

            const missingElements = elements.filter(({name, el}) => !el);
            if (missingElements.length > 0) {
                console.error('Missing UI elements:', missingElements.map(e => e.name));
                return false;
            }

            console.log('All UI elements found successfully');
            return true;
        } catch (error) {
            console.error('Error initializing UI elements:', error);
            return false;
        }
    }

    updateLoadingProgress(message, text = null) {
        if (this.loadingProgress) {
            this.loadingProgress.textContent = message;
        }
        if (text && this.loadingText) {
            this.loadingText.textContent = text;
        }
        window.updateLoadingProgress?.(message);
    }

    showLoading(visible, message = null) {
        console.log('Setting loading screen visibility:', visible);
        try {
            if (!this.loadingScreen) {
                this.loadingScreen = document.getElementById('loading-screen');
                if (!this.loadingScreen) {
                    console.error('Loading screen element not found!');
                    return;
                }
            }

            if (message) {
                this.updateLoadingProgress(message);
            }

            // Use CSS transitions for smooth loading screen
            if (visible) {
                this.loadingScreen.classList.remove('hidden');
                this.loadingScreen.style.display = 'flex';
            } else {
                this.loadingScreen.classList.add('hidden');
                // Remove from DOM after transition
                setTimeout(() => {
                    if (this.loadingScreen.classList.contains('hidden')) {
                        this.loadingScreen.style.display = 'none';
                    }
                }, 500); // Match transition duration from CSS
            }
        } catch (error) {
            console.error('Error showing/hiding loading screen:', error);
            // Fallback to instant visibility change
            if (this.loadingScreen) {
                this.loadingScreen.style.display = visible ? 'flex' : 'none';
            }
        }
    }

    showError(message) {
        try {
            if (!this.loadingScreen) return;
            
            this.loadingScreen.innerHTML = `
                <div class="error-message">
                    <h2>Error</h2>
                    <p>${message}</p>
                    <button onclick="location.reload()">Reload Game</button>
                </div>
            `;
            this.showLoading(true);
        } catch (error) {
            console.error('Error showing error message:', error);
        }
    }

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

    updateWaveComposition(currentWave, nextWave) {
        try {
            // Clear existing content
            this.waveCompositionElement.innerHTML = '';
            this.nextWaveCompositionElement.innerHTML = '';

            // Update current wave composition
            if (currentWave?.enemies) {
                currentWave.enemies.forEach(enemy => {
                    this.waveCompositionElement.appendChild(
                        this.createEnemyTypeIndicator(enemy.type, enemy.count)
                    );
                });
            }

            // Update next wave preview
            if (nextWave?.enemies) {
                nextWave.enemies.forEach(enemy => {
                    this.nextWaveCompositionElement.appendChild(
                        this.createEnemyTypeIndicator(enemy.type, enemy.count)
                    );
                });
            }
        } catch (error) {
            console.error('Error updating wave composition:', error);
        }
    }

    updateWaveProgress(current, total) {
        if (!this.waveProgressElement) return;
        const progress = total > 0 ? (1 - current / total) * 100 : 0;
        this.waveProgressElement.style.width = `${progress}%`;
    }

    updateUI(gameState, stats, currentWave, waveData) {
        try {
            // Re-initialize UI elements to ensure they're available
            if (!this.initializeUIElements()) {
                return;
            }

            // Update basic stats
            this.resourceCountElement.textContent = stats.resources;
            this.healthCountElement.textContent = stats.baseHealth;
            this.waveNumberElement.textContent = currentWave > 0 ? currentWave : '-';
            this.towerCostElement.textContent = TOWER_COST;

            // Update wave button state
            if (gameState === GAME_STATES.IDLE || gameState === GAME_STATES.WAVE_COMPLETE) {
                this.startWaveButton.disabled = false;
                this.startWaveButton.textContent = `Start Wave ${currentWave + 1}`;
                
                // Show next wave composition
                if (waveData && currentWave >= 0) {
                    const currentWaveData = (currentWave > 0) ? waveData[currentWave - 1] : null;
                    const nextWaveData = (currentWave < waveData.length) ? waveData[currentWave] : null;
                    this.updateWaveComposition(currentWaveData, nextWaveData);
                } else {
                    // Clear composition if no wave data available
                    this.updateWaveComposition(null, null);
                }
            } else {
                this.startWaveButton.disabled = true;
                this.startWaveButton.textContent = 'Wave in Progress...';
            }

            // Handle end game states
            if (gameState === GAME_STATES.VICTORY) {
                this.startWaveButton.textContent = 'You Win!';
                this.startWaveButton.disabled = true;
                this.nextWaveCompositionElement.innerHTML = '';
            } else if (gameState === GAME_STATES.GAME_OVER) {
                this.startWaveButton.textContent = 'Game Over!';
                this.startWaveButton.disabled = true;
                this.nextWaveCompositionElement.innerHTML = '';
            }
        } catch (error) {
            console.error('Error updating UI:', error);
        }
    }
}
