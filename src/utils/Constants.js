import * as THREE from 'three';

export const TOWER_COST = 50;

// Define the path for enemies (array of Vector3 points)
export const ENEMY_PATH = [
    new THREE.Vector3(4, 0.5, 0),   // Start point (adjust based on map)
    new THREE.Vector3(4, 0.5, 8.75), // Corner 1 (z = 5 * 1.75)
    new THREE.Vector3(13, 0.5, 8.75), // End point (x = (6 + 0.5) * 2) - Check this calculation if map changes
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
