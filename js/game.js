// Main game file
import { gameState, resetGameState } from './gameState.js';
import { Enemy } from './entities/Enemy.js';
import { Laser } from './entities/Laser.js';
import { Explosion } from './entities/Explosion.js';
import { checkCollision, getPhaseSettings, updateScore, initHighScore } from './utils/helpers.js';

// Get DOM elements
export const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const phaseElement = document.getElementById('phase');
const livesElements = document.querySelectorAll('.life-icon');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');

// Get start screen elements
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');
const gameContainer = document.getElementById('gameContainer');

// Initialize game state
gameState.highScore = initHighScore(highScoreElement);

// Initialize canvas size
function initCanvas() {
    // Set canvas size to match container
    const container = document.getElementById('gameContainer');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    // Initialize cannon position
    gameState.cannon.x = canvas.width / 2;
    gameState.cannon.y = canvas.height - 30;
}

// Initialize the game
function initGame() {
    // Reset game state
    gameState = {
        score: 0,
        highScore: parseInt(localStorage.getItem('highScore')) || 0,
        lives: 3,
        gameRunning: true,
        phase: 1,
        enemies: [],
        lasers: [],
        explosions: [],
        keys: {
            left: false,
            right: false,
            space: false
        },
        cannon: {
            x: canvas.width / 2,
            y: canvas.height - 30,
            speed: 5,
            angle: -Math.PI / 2,
            lastShot: 0,
            shotCooldown: 300
        },
        invulnerable: false,
        invulnerableStart: 0,
        hitEffect: {
            active: false,
            alpha: 0,
            startTime: 0
        }
    };
    
    initCanvas();
    resetGame();
    
    // Start the game loop
    if (!gameState.gameLoopRunning) {
        gameState.gameLoopRunning = true;
        requestAnimationFrame(gameLoop);
    }
}

// Start button event listener
startButton.addEventListener('click', () => {
    startScreen.style.display = 'none';
    gameContainer.style.display = 'block';
    initGame();
});

// Also start game on space/enter key from start screen
document.addEventListener('keydown', (e) => {
    if ((e.code === 'Space' || e.code === 'Enter') && startScreen.style.display !== 'none') {
        startScreen.style.display = 'none';
        gameContainer.style.display = 'block';
        initGame();
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    if (gameState.gameRunning) {
        initCanvas();
    }
});

// Game loop
let lastTime = 0;
function gameLoop(timestamp) {
    if (!gameState || !gameState.gameRunning) {
        return;
    }
    
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    try {
        // Clear canvas
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw game objects
        updateGame(deltaTime);
        render();
    } catch (error) {
        console.error('Error in game loop:', error);
        // Try to recover by resetting the game
        resetGame();
    }
    
    requestAnimationFrame(gameLoop);
}

// Event listeners
restartBtn.addEventListener('click', () => {
    // Hide game over screen
    gameOverElement.style.display = 'none';
    
    // Reset game state
    gameState = {
        score: 0,
        highScore: gameState.highScore, // Preserve high score
        lives: 3,
        gameRunning: true,
        phase: 1,
        enemies: [],
        lasers: [],
        explosions: [],
        keys: {
            left: false,
            right: false,
            space: false
        },
        cannon: {
            x: canvas.width / 2,
            y: canvas.height - 30,
            speed: 5,
            angle: -Math.PI / 2,
            lastShot: 0,
            shotCooldown: 300
        },
        invulnerable: false,
        invulnerableStart: 0,
        hitEffect: {
            active: false,
            alpha: 0,
            startTime: 0
        }
    };
    
    // Reset UI
    updateScore(0, gameState.highScore, scoreElement, highScoreElement);
    updateLives();
    
    const phaseSettings = getPhaseSettings(1);
    phaseElement.textContent = `PHASE 1: ${phaseSettings.name}`;
    livesElements.forEach(el => el.classList.remove('lost'));
    
    // Make sure the game container is visible
    gameContainer.style.display = 'block';
    
    // Restart the game loop
    lastTime = performance.now();
    if (!gameState.gameLoopRunning) {
        gameState.gameLoopRunning = true;
        requestAnimationFrame(gameLoop);
    }
});

document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft') gameState.keys.left = true;
    if (e.code === 'ArrowRight') gameState.keys.right = true;
    if (e.code === 'Space') gameState.keys.space = true;
    
    if (e.code === 'Space' && !gameState.gameRunning) {
        resetGame();
        gameOverElement.style.display = 'none';
        requestAnimationFrame(gameLoop);
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft') gameState.keys.left = false;
    if (e.code === 'ArrowRight') gameState.keys.right = false;
    if (e.code === 'Space') gameState.keys.space = false;
});

// Start the game
requestAnimationFrame(gameLoop);

// Game functions
function updateGame(deltaTime) {
    if (!gameState.gameRunning) return;
    
    // Update phase system
    updatePhase();
    
    // Always spawn enemies and update cannon, regardless of invulnerability
    spawnEnemy();
    updateCannon();
    
    // Update enemies
    for (let i = gameState.enemies.length - 1; i >= 0; i--) {
        const enemy = gameState.enemies[i];
        const hitBottom = enemy.update();
        
        if (hitBottom) {
            // Create explosion when enemy hits bottom
            gameState.explosions.push(new Explosion(
                enemy.x + enemy.width/2, 
                enemy.y + enemy.height/2, 
                'life'
            ));
            gameState.enemies.splice(i, 1);
            loseLife();
            continue;
        }
    }
    
    // Update lasers
    for (let i = gameState.lasers.length - 1; i >= 0; i--) {
        const laser = gameState.lasers[i];
        const offScreen = laser.update();
        
        if (offScreen) {
            gameState.lasers.splice(i, 1);
            continue;
        }
        
        // Check for collisions with enemies
        for (let j = gameState.enemies.length - 1; j >= 0; j--) {
            const enemy = gameState.enemies[j];
            
            if (checkCollision(laser.getBounds(), enemy.getBounds())) {
                // Create explosion
                gameState.explosions.push(new Explosion(
                    enemy.x + enemy.width/2,
                    enemy.y + enemy.height/2
                ));
                
                // Remove enemy and laser
                gameState.enemies.splice(j, 1);
                gameState.lasers.splice(i, 1);
                
                // Add score
                gameState.score += 10;
                gameState.highScore = updateScore(
                    gameState.score,
                    gameState.highScore,
                    scoreElement,
                    highScoreElement
                );
                
                break;
            }
        }
    }
    
    // Update explosions
    for (let i = gameState.explosions.length - 1; i >= 0; i--) {
        const explosion = gameState.explosions[i];
        const finished = explosion.update();
        
        if (finished) {
            gameState.explosions.splice(i, 1);
        }
    }
}

function render() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw game elements
    drawCannon();
    
    // Draw enemies
    gameState.enemies.forEach(enemy => enemy.draw());
    
    // Draw lasers
    gameState.lasers.forEach(laser => laser.draw());
    
    // Draw explosions
    gameState.explosions.forEach(explosion => explosion.draw());
    
    // Draw phase indicator
    const phaseProgress = (Date.now() - gameState.phase.lastPhaseChange) / gameState.phase.duration;
    if (phaseProgress < 1) {
        ctx.fillStyle = 'rgba(255, 165, 0, 0.5)';
        ctx.fillRect(10, 10, 200 * (1 - phaseProgress), 5);
    }
    
    // Draw hit effect if active
    if (gameState.hitEffect.active) {
        const elapsed = Date.now() - gameState.hitEffect.startTime;
        if (elapsed < gameState.hitEffect.duration) {
            // Fade out the red overlay
            const alpha = gameState.hitEffect.alpha * (1 - (elapsed / gameState.hitEffect.duration));
            ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            gameState.hitEffect.active = false;
        }
    }
    
    // Update invulnerability state
    if (gameState.invulnerable) {
        const elapsed = Date.now() - gameState.invulnerableStart;
        if (elapsed >= gameState.invulnerableDuration) {
            gameState.invulnerable = false;
        }
    }
}

function updatePhase() {
    const now = Date.now();
    const timeInPhase = now - gameState.phase.lastPhaseChange;
    
    if (timeInPhase > gameState.phase.duration) {
        gameState.phase.current++;
        gameState.phase.lastPhaseChange = now;
        
        const phaseSettings = getPhaseSettings(gameState.phase.current);
        gameState.spawnRate = phaseSettings.spawnRate;
        
        // Update phase display
        phaseElement.textContent = `PHASE ${gameState.phase.current}: ${phaseSettings.name}`;
    }
}

function findAlignedEnemy() {
    const cannon = gameState.cannon;
    const alignmentThreshold = 15; // Reduced threshold for more precise aiming
    let closestEnemy = null;
    let smallestDistance = alignmentThreshold;
    
    for (let enemy of gameState.enemies) {
        const enemyCenterX = enemy.x + enemy.width/2;
        const cannonCenterX = cannon.x;
        const distance = Math.abs(enemyCenterX - cannonCenterX);
        
        // Only consider enemies that are above the cannon
        if (enemy.y < cannon.y) {
            // Find the closest enemy within the alignment threshold
            if (distance <= alignmentThreshold && distance < smallestDistance) {
                closestEnemy = enemy;
                smallestDistance = distance;
            }
        }
    }
    
    return closestEnemy;
}

function updateCannon() {
    // Handle horizontal movement - always allow movement even when invulnerable
    if (gameState.keys.left && gameState.cannon.x > 20) {
        gameState.cannon.x -= gameState.cannon.speed;
    }
    if (gameState.keys.right && gameState.cannon.x < canvas.width - 20) {
        gameState.cannon.x += gameState.cannon.speed;
    }
    
    // Check if we're aligned with an enemy
    const alignedEnemy = findAlignedEnemy();
    
    // Only shoot if aligned with an enemy
    const now = Date.now();
    if (alignedEnemy && now - gameState.cannon.lastShot > gameState.cannon.shotCooldown) {
        // Add a small random delay to make it feel more natural
        const randomDelay = Math.random() * 100; // up to 100ms random delay
        
        setTimeout(() => {
            // Create laser that always shoots straight up
            gameState.lasers.push(new Laser(
                gameState.cannon.x,
                gameState.cannon.y - 20,
                0 // No angle, straight up
            ));
        }, randomDelay);
        
        gameState.cannon.lastShot = now;
    }
}

function spawnEnemy() {
    const now = Date.now();
    if (now - gameState.lastSpawn > gameState.spawnRate) {
        const phaseSettings = getPhaseSettings(gameState.phase.current);
        gameState.enemies.push(new Enemy(phaseSettings.speedMultiplier));
        gameState.lastSpawn = now;
    }
}

function drawCannon() {
    const cannon = gameState.cannon;
    const ctx = canvas.getContext('2d');
    const alignedEnemy = findAlignedEnemy();
    
    // Make sure cannon is at the bottom of the screen
    cannon.y = canvas.height - 15; // Position at bottom with slight offset
    
    ctx.save();
    ctx.translate(cannon.x, cannon.y);
    
    // Cannon base
    ctx.fillStyle = '#666';
    ctx.fillRect(-20, -10, 40, 15); // Adjusted y-position of base
    
    // Cannon barrel with targeting effect when aligned
    if (alignedEnemy) {
        // Pulsing glow when locked on
        const pulse = Math.sin(Date.now() * 0.01) * 0.3 + 0.7; // 0.4 to 1.0
        ctx.fillStyle = `rgba(255, 255, 255, ${pulse})`;
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 10;
    } else {
        ctx.fillStyle = '#00ffff';
        ctx.shadowBlur = 0;
    }
    
    // Draw barrel pointing up from base
    ctx.fillRect(-3, -30, 6, 25);
    
    // Cannon tip glow
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-1, -30, 2, 5);
    
    // Draw targeting reticle when aligned with enemy
    if (alignedEnemy) {
        ctx.save();
        ctx.translate(0, -35);
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
    
    ctx.restore();
}

function loseLife() {
    if (gameState.invulnerable) return;
    
    gameState.lives--;
    updateLives();
    
    // Trigger hit effect
    gameState.hitEffect.active = true;
    gameState.hitEffect.alpha = 0.7;
    gameState.hitEffect.startTime = Date.now();
    
    // Make player temporarily invulnerable (but still allow movement)
    gameState.invulnerable = true;
    gameState.invulnerableStart = Date.now();
    
    // Create explosion at cannon
    gameState.explosions.push(new Explosion(
        gameState.cannon.x,
        gameState.cannon.y - 20,
        'life'
    ));
    
    if (gameState.lives <= 0) {
        gameOver();
    }
}

function updateLives() {
    livesElements.forEach((element, index) => {
        if (index >= gameState.lives) {
            element.classList.add('lost');
        } else {
            element.classList.remove('lost');
        }
    });
}

function gameOver() {
    gameState.gameRunning = false;
    finalScoreElement.textContent = gameState.score;
    gameOverElement.style.display = 'block';
    
    // Show the start screen after a delay when game is over
    setTimeout(() => {
        gameOverElement.style.display = 'none';
        gameContainer.style.display = 'none';
        startScreen.style.display = 'flex';
    }, 3000);
}

function resetGame() {
    // This function is no longer used - reset logic is now in the restart button event listener
    console.log('resetGame() called - using new reset logic');
}
