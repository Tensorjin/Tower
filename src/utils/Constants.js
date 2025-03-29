import * as THREE from 'three';

export const TOWER_COST = 50;
const ENEMY_Y_POS = 0.6; // Slightly raise enemies

// Define the path for enemies (array of Vector3 points)
// Coordinates match the tile centers from createGameWorld
export const ENEMY_PATH = [
    new THREE.Vector3(4, ENEMY_Y_POS, 0),    // Start tile (x=2, z=0) -> x = (2 + 0*0.5)*2 = 4
    new THREE.Vector3(5, ENEMY_Y_POS, 8.75), // Corner tile (x=2, z=5) -> x = (2 + 1*0.5)*2 = 5, z = 5 * 1.75 = 8.75
    new THREE.Vector3(13, ENEMY_Y_POS, 8.75),// End tile (x=6, z=5) -> x = (6 + 1*0.5)*2 = 13
];

// Wave Configuration: [ { count: number, delay: seconds } ]
export const WAVE_CONFIG = [
    { count: 5, delay: 1.0 }, // Wave 1
    { count: 8, delay: 0.8 }, // Wave 2
    { count: 12, delay: 0.6 }, // Wave 3
];

export const GAME_STATES = {
    IDLE: 'idle',
    WAVE_SPAWNING: 'wave_spawning',
    WAVE_ACTIVE: 'wave_active',
    WAVE_COMPLETE: 'wave_complete',
    GAME_OVER: 'game_over',
    VICTORY: 'victory',
};
