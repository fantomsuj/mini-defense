import { canvas } from '../game.js';

export class Explosion {
    constructor(x, y, type = 'enemy') {
        this.x = x;
        this.y = y;
        this.particles = [];
        this.maxAge = 30;
        this.age = 0;
        this.type = type;
        
        // Create particles
        const particleCount = type === 'life' ? 20 : 12;
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: 0,
                y: 0,
                vx: (Math.random() - 0.5) * (type === 'life' ? 8 : 4),
                vy: (Math.random() - 0.5) * (type === 'life' ? 8 : 4),
                size: Math.random() * (type === 'life' ? 4 : 3) + 1,
                color: type === 'life' ? 
                    `hsl(${Math.random() * 60 + 15}, 100%, ${50 + Math.random() * 30}%)` : // Orange/red/yellow for life loss
                    `hsl(${Math.random() * 360}, 100%, ${50 + Math.random() * 30}%)` // Rainbow for enemy
            });
        }
    }
    
    update() {
        this.age++;
        
        // Update particles
        for (let particle of this.particles) {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vx *= 0.98; // Friction
            particle.vy *= 0.98;
            particle.vy += 0.1; // Gravity
        }
        
        return this.age >= this.maxAge;
    }
    
    draw() {
        const ctx = canvas.getContext('2d');
        const alpha = 1 - (this.age / this.maxAge);
        
        ctx.save();
        ctx.translate(this.x, this.y);
        
        for (let particle of this.particles) {
            ctx.globalAlpha = alpha;
            ctx.fillStyle = particle.color;
            ctx.shadowColor = particle.color;
            ctx.shadowBlur = particle.size * 2;
            
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
    }
}
