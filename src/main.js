import { Game } from './core/Game.js';

let game;

window.addEventListener('DOMContentLoaded', () => {
    // Initialize game
    game = new Game();
    // Setup UI event listeners
    const startWaveButton = document.getElementById('start-wave');
    startWaveButton.addEventListener('click', () => {
        if (game) {
            game.startNextWave(); // Call the game's method to start the wave
        }
    });

    // UI is now initialized and updated within Game.js's updateUI method
});
