import { WAVE_CONFIG, GAME_STATES } from '../utils/Constants.js';

export class WaveSystem {
    constructor(game) {
        this.game = game; // Reference to the main game class
        this.waveConfig = WAVE_CONFIG;
        this.currentWave = 0;
        this.remainingEnemies = [];    // Queue of enemies to spawn
        this.spawnTimer = 0;
        this.spawnDelay = 0;
        this.totalEnemiesInWave = 0;   // Track total enemies for progress bar
    }

    // Fisher-Yates shuffle algorithm
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    getTotalEnemiesInWave() {
        if (this.currentWave === 0 || this.currentWave > this.waveConfig.length) {
            return 0;
        }
        // Ensure wave data exists before calculating total
        const waveData = this.waveConfig[this.currentWave - 1];
        if (!waveData || !waveData.enemies) {
            return 0;
        }
        // Calculate total if not already cached (or recalculate)
        if (this.totalEnemiesInWave === 0 && waveData.enemies) {
             this.totalEnemiesInWave = waveData.enemies.reduce((sum, group) => sum + group.count, 0);
        }
        return this.totalEnemiesInWave;
    }

    startNextWave() {
        const gameState = this.game.gameState;
        if ((gameState === GAME_STATES.IDLE || gameState === GAME_STATES.WAVE_COMPLETE) 
            && this.currentWave < this.waveConfig.length) {
            this.currentWave++;
            const waveData = this.waveConfig[this.currentWave - 1];
            this.spawnDelay = waveData.delay;
            this.spawnTimer = this.spawnDelay;

            // Create spawn queue from wave configuration
            this.remainingEnemies = [];
            this.totalEnemiesInWave = 0; // Reset total count

            // Calculate total enemies and create spawn queue
            for (const enemyGroup of waveData.enemies) {
                this.totalEnemiesInWave += enemyGroup.count;
                for (let i = 0; i < enemyGroup.count; i++) {
                    this.remainingEnemies.push(enemyGroup.type);
                }
            }
            // Shuffle the spawn queue for variety
            this.shuffleArray(this.remainingEnemies);

            this.game.setGameState(GAME_STATES.WAVE_SPAWNING);
            console.log(`Starting Wave ${this.currentWave} with ${this.remainingEnemies.length} enemies`);
        }
    }

    update(deltaTime) {
        if (this.game.gameState === GAME_STATES.WAVE_SPAWNING) {
            this.spawnTimer -= deltaTime;
            if (this.spawnTimer <= 0 && this.remainingEnemies.length > 0) {
                const enemyType = this.remainingEnemies.pop();
                this.game.spawnEnemy(enemyType);
                this.spawnTimer = this.spawnDelay;

                if (this.remainingEnemies.length === 0) {
                    this.game.setGameState(GAME_STATES.WAVE_ACTIVE);
                }
            }
        }
    }

    getCurrentWaveNumber() {
        return this.currentWave;
    }

    isWaveComplete() {
        // Only check completion if wave is active or spawning
        if (this.game.gameState !== GAME_STATES.WAVE_ACTIVE && 
            this.game.gameState !== GAME_STATES.WAVE_SPAWNING) {
            return false;
        }
        
        // Make sure all enemies are spawned and defeated
        const noRemainingEnemies = this.remainingEnemies.length === 0;
        const noActiveEnemies = this.game.enemies.length === 0;
        const isComplete = noRemainingEnemies && noActiveEnemies;

        if (isComplete) {
            console.log('Wave completed:', {
                currentWave: this.currentWave,
                totalWaves: this.waveConfig.length,
                remainingEnemies: this.remainingEnemies.length,
                activeEnemies: this.game.enemies.length
            });
        }

        return isComplete;
    }

    isAllWavesComplete() {
        return this.currentWave >= this.waveConfig.length;
    }
}
