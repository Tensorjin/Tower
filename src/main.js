import { Game } from './core/Game.js';
import * as THREE from 'three';

// Check that Three.js is loaded correctly
console.assert(THREE, 'Three.js module not loaded');
console.assert(THREE.WebGLRenderer, 'Three.js WebGLRenderer not available');

// Setup global error handlers
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Global error:', {
        message: msg,
        url: url,
        line: lineNo,
        column: columnNo,
        error: error,
        stack: error?.stack
    });
    return false;
};

// Initialization function
async function initializeGame() {
    console.log('Starting game initialization...');

    try {
        // Verify WebGL support
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) {
            throw new Error('WebGL not supported');
        }
        console.log('WebGL supported');

        // Check for required elements
        const container = document.getElementById('game-container');
        if (!container) {
            throw new Error('Game container not found');
        }
        console.log('Game container found');

        // Initialize loading screen
        const loadingScreen = document.getElementById('loading-screen');
        if (!loadingScreen) {
            throw new Error('Loading screen not found');
        }
        console.log('Loading screen found');

        // Initialize game
        console.log('Creating game instance...');
        window.game = new Game();
        console.log('Game instance created');

        // Setup resize handler
        window.addEventListener('resize', () => {
            if (window.game) {
                window.game.onWindowResize?.();
            }
        });

        // Setup cleanup
        window.addEventListener('beforeunload', () => {
            if (window.game) {
                console.log('Cleaning up game resources...');
                window.game.cleanup?.();
            }
        });

        console.log('Game initialization complete');

    } catch (error) {
        console.error('Failed to initialize game:', error);
        showErrorMessage(error.message);
        throw error;
    }
}

// Error message display
function showErrorMessage(message) {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.innerHTML = `
            <div class="error-message">
                <h2>Failed to Start Game</h2>
                <p>${message}</p>
                <p class="error-details">Check the browser console for more details.</p>
                <button onclick="location.reload()">Retry</button>
            </div>
        `;
        loadingScreen.style.display = 'flex';
    }
}

// Initialize game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM Content Loaded, initializing game...');
        initializeGame().catch(error => {
            console.error('Game initialization failed:', error);
        });
    });
} else {
    console.log('DOM already loaded, initializing game...');
    initializeGame().catch(error => {
        console.error('Game initialization failed:', error);
    });
}

// Development helper functions
window.debugGame = {
    getGameInstance: () => window.game,
    showLoadingScreen: () => window.game?.uiManager.showLoading(true),
    hideLoadingScreen: () => window.game?.uiManager.showLoading(false),
    checkSystems: () => {
        if (!window.game) return 'Game not initialized';
        return {
            renderer: !!window.game.renderer,
            scene: !!window.game.scene,
            camera: !!window.game.camera,
            uiManager: !!window.game.uiManager,
            resourceManager: !!window.game.resourceManager,
            waveSystem: !!window.game.waveSystem,
            enemySystem: !!window.game.enemySystem,
            towerManager: !!window.game.towerManager
        };
    },
    restartGame: () => {
        if (window.game) {
            window.game.cleanup();
            window.game = new Game();
        }
    }
};
