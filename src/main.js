import { Game } from './core/Game.js';

let game;

window.addEventListener('DOMContentLoaded', () => {
    // Initialize game
    game = new Game();
    // Setup UI event listeners
    const startWaveButton = document.getElementById('start-wave');
    startWaveButton.addEventListener('click', () => {
        // Access the wave system through the game instance
        if (game && game.waveSystem) {
            game.waveSystem.startNextWave();
        }
    });

    // UI is now initialized and updated within Game.js's updateUI method
});
