// Game state management
export const gameState = {
    score: 0,
    highScore: 0,
    lives: 3,
    gameRunning: true,
    cannon: {
        x: 0, // Will be set in game initialization
        y: 0, // Will be set in game initialization
        angle: 0,
        speed: 5,
        lastShot: 0,
        shotCooldown: 200
    },
    enemies: [],
    lasers: [],
    keys: {
        left: false,
        right: false,
        space: false
    },
    lastSpawn: 0,
    spawnRate: 1500, // ms between enemy spawns
    phase: {
        current: 1,
        timer: 0,
        duration: 30000, // 30 seconds per phase
        lastPhaseChange: 0
    },
    explosions: [],
    hitEffect: {
        active: false,
        alpha: 0,
        duration: 300, // ms
        startTime: 0
    },
    invulnerable: false,
    invulnerableDuration: 1500, // ms
    invulnerableStart: 0
};

export function resetGameState() {
    gameState.score = 0;
    gameState.lives = 3;
    gameState.gameRunning = true;
    gameState.enemies = [];
    gameState.lasers = [];
    gameState.explosions = [];
    gameState.spawnRate = 2000; // Start with CALM phase settings
    gameState.lastSpawn = 0;
    gameState.cannon.x = canvas.width / 2;
    gameState.cannon.y = canvas.height - 30;
    gameState.phase = {
        current: 1,
        timer: 0,
        duration: 30000,
        lastPhaseChange: Date.now()
    };
    gameState.hitEffect.active = false;
    gameState.invulnerable = false;
}
