import * as THREE from 'three';

export const TOWER_COST = 50;
const ENEMY_Y_POS = 0.2; // Set Y position to the tile surface height

// Define the path for enemies (array of Vector3 points)
// Coordinates match the tile centers from createGameWorld
export const ENEMY_PATH = [
    new THREE.Vector3(4, ENEMY_Y_POS, 0),    // Start tile (x=2, z=0) -> x = (2 + 0*0.5)*2 = 4
    new THREE.Vector3(5, ENEMY_Y_POS, 8.75), // Corner tile (x=2, z=5) -> x = (2 + 1*0.5)*2 = 5, z = 5 * 1.75 = 8.75
    new THREE.Vector3(13, ENEMY_Y_POS, 8.75),// End tile (x=6, z=5) -> x = (6 + 1*0.5)*2 = 13
];

// Wave Configuration with enemy types and spawn details
export const WAVE_CONFIG = [
    {   // Wave 1: Basic enemies
        enemies: [
            { type: 'basic', count: 5 }
        ],
        delay: 1.0
    },
    {   // Wave 2: Basic + Fast enemies
        enemies: [
            { type: 'basic', count: 4 },
            { type: 'fast', count: 3 }
        ],
        delay: 0.8
    },
    {   // Wave 3: Mixed enemies
        enemies: [
            { type: 'basic', count: 4 },
            { type: 'fast', count: 4 },
            { type: 'tank', count: 2 }
        ],
        delay: 0.7
    },
    {   // Wave 4: Tanks and Flying
        enemies: [
            { type: 'tank', count: 3 },
            { type: 'flying', count: 4 }
        ],
        delay: 0.7
    },
    {   // Wave 5: Swarm wave
        enemies: [
            { type: 'swarm', count: 5 }
        ],
        delay: 0.8
    },
    {   // Wave 6: Final Boss wave
        enemies: [
            { type: 'boss', count: 1 }
        ],
        delay: 1.0
    }
];

export const GAME_STATES = {
    IDLE: 'idle',
    WAVE_SPAWNING: 'wave_spawning',
    WAVE_ACTIVE: 'wave_active',
    WAVE_COMPLETE: 'wave_complete',
    GAME_OVER: 'game_over',
    VICTORY: 'victory',
};
