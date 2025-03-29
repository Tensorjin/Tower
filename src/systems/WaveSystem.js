import { WAVE_CONFIG, GAME_STATES } from '../utils/Constants.js';

export class WaveSystem {
    constructor(game) {
        this.game = game; // Reference to the main game class
        this.waveConfig = WAVE_CONFIG;
        this.currentWave = 0;
        this.enemiesToSpawn = 0;
        this.spawnTimer = 0;
        this.spawnDelay = 0;
    }

    startNextWave() {
        const gameState = this.game.gameState;
        if ((gameState === GAME_STATES.IDLE || gameState === GAME_STATES.WAVE_COMPLETE) && this.currentWave < this.waveConfig.length) {
            this.currentWave++;
            const waveData = this.waveConfig[this.currentWave - 1];
            this.enemiesToSpawn = waveData.count;
            this.spawnDelay = waveData.delay;
            this.spawnTimer = this.spawnDelay; // Start timer for first spawn
            this.game.setGameState(GAME_STATES.WAVE_SPAWNING); // Update game state via game reference
            console.log(`Starting Wave ${this.currentWave}`);
        }
    }

    update(deltaTime) {
        if (this.game.gameState === GAME_STATES.WAVE_SPAWNING) {
            this.spawnTimer -= deltaTime;
            if (this.spawnTimer <= 0 && this.enemiesToSpawn > 0) {
                this.game.spawnEnemy(); // Call game's spawn function
                this.enemiesToSpawn--;
                this.spawnTimer = this.spawnDelay; // Reset timer for next spawn

                if (this.enemiesToSpawn === 0) {
                    // All enemies for this wave have been spawned
                    this.game.setGameState(GAME_STATES.WAVE_ACTIVE);
                }
            }
        }
    }

    getCurrentWaveNumber() {
        return this.currentWave;
    }

    isWaveComplete() {
        // Check if the current wave is active and all enemies are gone
        return this.game.gameState === GAME_STATES.WAVE_ACTIVE && this.game.enemies.length === 0 && this.enemiesToSpawn === 0;
    }

    isAllWavesComplete() {
        return this.currentWave >= this.waveConfig.length;
    }
}
