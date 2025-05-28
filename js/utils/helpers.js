// Helper functions
export function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

export function getPhaseSettings(phaseNumber) {
    const phases = [
        { name: 'CALM', speedMultiplier: 1.0, spawnRate: 2000 },
        { name: 'WARMING UP', speedMultiplier: 1.2, spawnRate: 1600 },
        { name: 'INTENSE', speedMultiplier: 1.5, spawnRate: 1200 },
        { name: 'FRENZY', speedMultiplier: 2.0, spawnRate: 800 },
        { name: 'IMPOSSIBLE', speedMultiplier: 3.0, spawnRate: 500 }
    ];
    
    // Cap at the last phase
    const phaseIndex = Math.min(phaseNumber - 1, phases.length - 1);
    return phases[phaseIndex];
}

export function updateScore(score, highScore, scoreElement, highScoreElement) {
    scoreElement.textContent = score;
    
    if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = `HIGH SCORE: ${highScore}`;
        // Save to localStorage
        localStorage.setItem('laserDefenseHighScore', highScore);
    }
    
    return highScore;
}

export function initHighScore(highScoreElement) {
    const savedHighScore = parseInt(localStorage.getItem('laserDefenseHighScore') || '0');
    highScoreElement.textContent = `HIGH SCORE: ${savedHighScore}`;
    return savedHighScore;
}
