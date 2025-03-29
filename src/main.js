import { Game } from './core/Game.js';

let game;

window.addEventListener('DOMContentLoaded', () => {
    // Initialize game
    game = new Game();
    
    // Setup UI event listeners
    const startWaveButton = document.getElementById('start-wave');
    startWaveButton.addEventListener('click', () => {
        startWaveButton.disabled = true;
        
        // Spawn 5 enemies with delay
        let enemiesSpawned = 0;
        const spawnInterval = setInterval(() => {
            game.spawnEnemy();
            enemiesSpawned++;
            
            if (enemiesSpawned >= 5) {
                clearInterval(spawnInterval);
                startWaveButton.disabled = false;
                
                // Update wave number
                game.currentWave++;
                document.getElementById('wave-number').textContent = game.currentWave;
                
                // Add resources for completing wave
                game.resources += 50;
                document.getElementById('resource-count').textContent = game.resources;
            }
        }, 1000); // Spawn enemy every second
    });
    
    // Initialize UI
    document.getElementById('resource-count').textContent = game.resources;
    document.getElementById('health-count').textContent = game.baseHealth;
    document.getElementById('wave-number').textContent = game.currentWave;
});
