import { canvas } from '../game.js';

export class Laser {
    constructor(x, y, angle = 0) {
        this.x = x;
        this.y = y;
        this.speed = 10;
        this.angle = 0; // Always straight up
        this.damage = 1;
        this.width = 3;
        this.height = 15;
        this.active = true;
    }
    
    update() {
        this.x += Math.sin(this.angle) * this.speed;
        this.y -= Math.cos(this.angle) * this.speed;
        return this.y < -20 || this.x < 0 || this.x > canvas.width;
    }
    
    draw() {
        const ctx = canvas.getContext('2d');
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Laser beam
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        
        // Glow effect
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-1, -this.height/2, 2, this.height);
        
        ctx.restore();
        ctx.shadowBlur = 0;
    }
    
    getBounds() {
        return {
            x: this.x - this.width/2,
            y: this.y - this.height/2,
            width: this.width,
            height: this.height
        };
    }
}
