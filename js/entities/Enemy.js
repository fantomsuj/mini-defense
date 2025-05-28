import { canvas } from '../game.js';

export class Enemy {
    constructor(phaseModifier = 1) {
        this.x = Math.random() * (canvas.width - 30);
        this.y = -30;
        this.width = 25;
        this.height = 25;
        this.speed = (1 + Math.random() * 2) * phaseModifier;
        
        // Different enemy types with different icons and values
        const enemyTypes = [
            { type: 'square', color: '#ff4444', points: 10 },
            { type: 'triangle', color: '#44ff44', points: 15 },
            { type: 'diamond', color: '#4444ff', points: 20 },
            { type: 'circle', color: '#ff44ff', points: 25 }
        ];
        
        const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        this.type = randomType.type;
        this.color = randomType.color;
        this.points = Math.floor(randomType.points * phaseModifier);
    }
    
    update() {
        this.y += this.speed;
        return this.y > canvas.height;
    }
    
    draw() {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 8;
        
        switch(this.type) {
            case 'square':
                ctx.fillRect(this.x, this.y, this.width, this.height);
                break;
            case 'triangle':
                ctx.beginPath();
                ctx.moveTo(this.x + this.width/2, this.y);
                ctx.lineTo(this.x, this.y + this.height);
                ctx.lineTo(this.x + this.width, this.y + this.height);
                ctx.closePath();
                ctx.fill();
                break;
            case 'diamond':
                ctx.beginPath();
                ctx.moveTo(this.x + this.width/2, this.y);
                ctx.lineTo(this.x + this.width, this.y + this.height/2);
                ctx.lineTo(this.x + this.width/2, this.y + this.height);
                ctx.lineTo(this.x, this.y + this.height/2);
                ctx.closePath();
                ctx.fill();
                break;
            case 'circle':
                ctx.beginPath();
                ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI * 2);
                ctx.fill();
                break;
        }
        
        ctx.shadowBlur = 0;
    }
    
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}
