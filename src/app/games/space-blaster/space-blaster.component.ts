import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, HostListener, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Entity {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  type: string;
  color: string;
  hp?: number;
  markedForDeletion: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
}

@Component({
  selector: 'app-space-blaster',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fullscreen-container">
      <canvas #gameCanvas [width]="width" [height]="height"
              (touchstart)="onTouchStart($event)"
              (touchmove)="onTouchMove($event)"
              (touchend)="onTouchEnd($event)"></canvas>
      
      <div class="hud" *ngIf="isPlaying()">
        <div class="hud-stats">
          <span>Score: {{ score() }}</span>
          <span class="lives-text">Lives: {{ lives() }}</span>
        </div>
        <button class="btn-exit" (click)="exitGame()">Exit Game</button>
      </div>

      <!-- Mobile Guide overlay -->
      <div class="mobile-tip" *ngIf="isMobile() && isPlaying()">
        Drag ship to move & auto-fire!
      </div>

      <div class="menu-overlay" *ngIf="!isPlaying()">
        <h2>🚀 Space Blaster</h2>
        <p>{{ isMobile() ? 'Drag your finger anywhere to move and shoot!' : 'Arrow keys to move, SPACE to shoot!' }}</p>
        
        <div *ngIf="gameOver()" class="game-over-text">GAME OVER</div>
        <div *ngIf="gameOver()" class="final-score">Final Score: {{ score() }}</div>
        
        <div class="menu-buttons">
          <button class="btn-primary" (click)="startGame()">
            {{ gameOver() ? 'Play Again' : 'Start Game' }}
          </button>
          <button class="btn-secondary" (click)="exitGame()">Back to Arcade</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .fullscreen-container {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: #020617; z-index: 9999; overflow: hidden;
      display: flex; justify-content: center; align-items: center;
    }
    canvas { display: block; }
    
    .hud {
      position: absolute; top: 1.5rem; left: 1.5rem; right: 1.5rem;
      display: flex; justify-content: space-between; align-items: flex-start;
      z-index: 10000; pointer-events: none;
    }
    .hud-stats {
      background: rgba(0,0,0,0.5); padding: 1rem 2rem; border-radius: 8px;
      display: flex; gap: 2rem; font-family: monospace; font-size: 1.5rem; font-weight: bold;
      color: white; border: 1px solid rgba(255,255,255,0.1); pointer-events: auto;
    }
    .lives-text { color: #ef4444; }
    
    .btn-exit {
      pointer-events: auto; padding: 0.75rem 1.5rem; border-radius: 8px;
      background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2);
      cursor: pointer; font-weight: bold; transition: all 0.2s; font-size: 1.1rem;
    }
    .btn-exit:hover { background: rgba(255,255,255,0.2); }
    
    .menu-overlay {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: rgba(15, 23, 42, 0.9); padding: 2.5rem; border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.1); text-align: center;
      display: flex; flex-direction: column; gap: 1.5rem; align-items: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); z-index: 10000;
      width: 90%; max-width: 450px;
    }
    
    .menu-overlay h2 { font-size: 2.5rem; margin: 0; color: white; }
    .menu-overlay p { font-size: 1.1rem; color: #94a3b8; margin: 0; }
    .game-over-text { color: #ef4444; font-weight: bold; font-size: 2.5rem; letter-spacing: 4px; margin-top: 1rem; }
    .final-score { color: #fbbf24; font-size: 1.8rem; font-weight: bold; }
    
    .menu-buttons { display: flex; gap: 1rem; margin-top: 1.5rem; }
    .btn-primary {
      padding: 1rem 2rem; font-size: 1.2rem; border-radius: 8px; font-weight: 600;
      cursor: pointer; border: none; background: var(--accent-blue, #3b82f6); color: white;
      text-transform: uppercase; letter-spacing: 1px; transition: transform 0.2s;
    }
    .btn-primary:hover { transform: scale(1.05); }
    .btn-secondary {
      padding: 1rem 2rem; font-size: 1.2rem; border-radius: 8px; font-weight: 600;
      cursor: pointer; border: 1px solid rgba(255,255,255,0.2); background: transparent; color: white;
      transition: background 0.2s;
    }
    .btn-secondary:hover { background: rgba(255,255,255,0.1); }

    /* Mobile floating tip overlay */
    .mobile-tip {
      position: absolute; bottom: 2rem;
      background: rgba(59, 130, 246, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(59, 130, 246, 0.15);
      padding: 0.75rem 1.5rem; border-radius: 20px;
      color: #93c5fd; font-weight: bold; font-size: 1rem;
      box-shadow: 0 0 15px rgba(59, 130, 246, 0.15);
      pointer-events: none;
      z-index: 10000;
      animation: pulseSpace 2s infinite;
    }
    @keyframes pulseSpace {
      0% { transform: scale(1); opacity: 0.8; }
      50% { transform: scale(1.03); opacity: 1; }
      100% { transform: scale(1); opacity: 0.8; }
    }
  `]
})
export class SpaceBlasterComponent implements AfterViewInit, OnDestroy {
  @ViewChild('gameCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private router = inject(Router);
  
  width = window.innerWidth;
  height = window.innerHeight;
  
  score = signal(0);
  lives = signal(3);
  isPlaying = signal(false);
  gameOver = signal(false);
  isMobile = signal(false);
  
  private ctx!: CanvasRenderingContext2D;
  private gameLoopId: any;
  
  // Game State
  private player!: Entity;
  private bullets: Entity[] = [];
  private enemies: Entity[] = [];
  private particles: Particle[] = [];
  private stars: Star[] = [];
  
  // Input State
  private keys = { left: false, right: false, up: false, down: false, space: false };
  private lastShotTime = 0;
  private lastEnemySpawn = 0;
  private difficultyMultiplier = 1;

  constructor() {
    this.checkDevice();
  }

  @HostListener('window:resize')
  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.checkDevice();
  }

  checkDevice() {
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const isSmallScreen = window.innerWidth <= 768;
    this.isMobile.set(isTouch || isSmallScreen);
  }

  ngAfterViewInit() {
    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
    this.initStars();
    this.drawInitial();
  }

  ngOnDestroy() {
    this.stopGameLoop();
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    if (!this.isPlaying()) return;
    switch (e.code) {
      case 'ArrowLeft': case 'KeyA': this.keys.left = true; break;
      case 'ArrowRight': case 'KeyD': this.keys.right = true; break;
      case 'ArrowUp': case 'KeyW': this.keys.up = true; break;
      case 'ArrowDown': case 'KeyS': this.keys.down = true; break;
      case 'Space': this.keys.space = true; break;
    }
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) {
      e.preventDefault();
    }
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(e: KeyboardEvent) {
    switch (e.code) {
      case 'ArrowLeft': case 'KeyA': this.keys.left = false; break;
      case 'ArrowRight': case 'KeyD': this.keys.right = false; break;
      case 'ArrowUp': case 'KeyW': this.keys.up = false; break;
      case 'ArrowDown': case 'KeyS': this.keys.down = false; break;
      case 'Space': this.keys.space = false; break;
    }
  }

  // Mobile Touch Listeners
  onTouchStart(e: TouchEvent) {
    if (!this.isPlaying()) return;
    e.preventDefault();
    this.keys.space = true; // Auto shoot on touch
    this.handleTouchMove(e);
  }

  onTouchMove(e: TouchEvent) {
    if (!this.isPlaying()) return;
    e.preventDefault();
    this.handleTouchMove(e);
  }

  onTouchEnd(e: TouchEvent) {
    if (!this.isPlaying()) return;
    e.preventDefault();
    this.keys.space = false; // Stop shooting
  }

  private handleTouchMove(e: TouchEvent) {
    if (!this.player) return;
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    const touchY = e.touches[0].clientY - rect.top;
    
    // Position 45px above finger so visual ship remains visible
    this.player.x = touchX;
    this.player.y = touchY - 45;
    
    // Bounding box checks
    if (this.player.x < this.player.w / 2) this.player.x = this.player.w / 2;
    if (this.player.x > this.width - this.player.w / 2) this.player.x = this.width - this.player.w / 2;
    if (this.player.y < this.player.h / 2) this.player.y = this.player.h / 2;
    if (this.player.y > this.height - this.player.h / 2) this.player.y = this.height - this.player.h / 2;
  }
  
  exitGame() {
    this.stopGameLoop();
    this.router.navigate(['/games']);
  }

  startGame() {
    this.score.set(0);
    this.lives.set(3);
    this.gameOver.set(false);
    this.isPlaying.set(true);
    
    this.bullets = [];
    this.enemies = [];
    this.particles = [];
    this.difficultyMultiplier = 1;
    
    this.player = {
      x: this.width / 2, y: this.height - 100, w: 40, h: 40,
      vx: 0, vy: 0, type: 'player', color: '#3b82f6', markedForDeletion: false
    };
    
    this.startGameLoop();
  }

  private initStars() {
    this.stars = [];
    // Increase star count for larger screen
    for (let i = 0; i < 200; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 3 + 1
      });
    }
  }

  private startGameLoop() {
    this.stopGameLoop();
    let lastTime = performance.now();
    
    const loop = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;
      
      this.update(time);
      this.draw();
      
      if (this.isPlaying()) {
        this.gameLoopId = requestAnimationFrame(loop);
      }
    };
    this.gameLoopId = requestAnimationFrame(loop);
  }

  private stopGameLoop() {
    if (this.gameLoopId) {
      cancelAnimationFrame(this.gameLoopId);
    }
  }

  private update(time: number) {
    this.difficultyMultiplier = 1 + this.score() / 2000;
    
    // Player Movement
    const speed = 7; // slightly faster for full screen
    if (this.keys.left) this.player.x -= speed;
    if (this.keys.right) this.player.x += speed;
    if (this.keys.up) this.player.y -= speed;
    if (this.keys.down) this.player.y += speed;
    
    // Clamp to screen
    this.player.x = Math.max(this.player.w/2, Math.min(this.width - this.player.w/2, this.player.x));
    this.player.y = Math.max(this.player.h/2, Math.min(this.height - this.player.h/2, this.player.y));
    
    // Shooting
    if (this.keys.space && time - this.lastShotTime > 150) {
      this.bullets.push({
        x: this.player.x, y: this.player.y - this.player.h/2, w: 4, h: 15,
        vx: 0, vy: -15, type: 'bullet', color: '#38bdf8', markedForDeletion: false
      });
      this.lastShotTime = time;
    }
    
    // Spawning Enemies
    // Spawn faster on wider screens to keep density up
    const spawnRate = (1000 / this.difficultyMultiplier) * (600 / Math.max(600, this.width));
    
    if (time - this.lastEnemySpawn > spawnRate) {
      const isAsteroid = Math.random() > 0.5;
      const size = isAsteroid ? Math.random() * 30 + 30 : 40;
      this.enemies.push({
        x: Math.random() * (this.width - size) + size/2, y: -50, w: size, h: size,
        vx: (Math.random() - 0.5) * 3, vy: (Math.random() * 2 + 3) * this.difficultyMultiplier,
        type: isAsteroid ? 'asteroid' : 'ship',
        color: isAsteroid ? '#94a3b8' : '#ef4444',
        hp: isAsteroid ? 3 : 1,
        markedForDeletion: false
      });
      this.lastEnemySpawn = time;
    }
    
    // Update Stars
    for (const star of this.stars) {
      star.y += star.speed * this.difficultyMultiplier * 0.5;
      if (star.y > this.height) {
        star.y = 0;
        star.x = Math.random() * this.width;
      }
    }
    
    // Update Bullets
    for (const b of this.bullets) {
      b.x += b.vx; b.y += b.vy;
      if (b.y < -50) b.markedForDeletion = true;
    }
    
    // Update Enemies
    for (const e of this.enemies) {
      e.x += e.vx; e.y += e.vy;
      if (e.y > this.height + 50) e.markedForDeletion = true;
      
      // Check collision with player
      if (this.checkAABB(this.player, e)) {
        e.markedForDeletion = true;
        this.createExplosion(e.x, e.y, e.color, 30);
        this.die();
      }
    }
    
    // Bullet to Enemy Collision
    for (const b of this.bullets) {
      for (const e of this.enemies) {
        if (!b.markedForDeletion && !e.markedForDeletion && this.checkAABB(b, e)) {
          b.markedForDeletion = true;
          e.hp! -= 1;
          this.createExplosion(b.x, b.y, '#38bdf8', 8); // small hit spark
          
          if (e.hp! <= 0) {
            e.markedForDeletion = true;
            this.createExplosion(e.x, e.y, e.color, e.type === 'asteroid' ? 40 : 25);
            this.score.update(s => s + (e.type === 'asteroid' ? 50 : 100));
          }
        }
      }
    }
    
    // Update Particles
    for (const p of this.particles) {
      p.x += p.vx; p.y += p.vy;
      p.life--;
    }
    
    // Cleanup
    this.bullets = this.bullets.filter(b => !b.markedForDeletion);
    this.enemies = this.enemies.filter(e => !e.markedForDeletion);
    this.particles = this.particles.filter(p => p.life > 0);
  }
  
  private die() {
    this.lives.update(l => l - 1);
    this.createExplosion(this.player.x, this.player.y, '#3b82f6', 60);
    
    if (this.lives() <= 0) {
      this.gameOver.set(true);
      this.isPlaying.set(false);
    } else {
      // respawn shield or clear enemies around? For now just reset pos
      this.player.x = this.width / 2;
      this.player.y = this.height - 100;
      // Clear immediate threats
      this.enemies = this.enemies.filter(e => e.y < this.height / 2);
    }
  }
  
  private checkAABB(a: Entity, b: Entity): boolean {
    return Math.abs(a.x - b.x) < (a.w/2 + b.w/2) * 0.8 && // 0.8 is a forgiving hitbox ratio
           Math.abs(a.y - b.y) < (a.h/2 + b.h/2) * 0.8;
  }
  
  private createExplosion(x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 1;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 30 + Math.random() * 30,
        maxLife: 60,
        color
      });
    }
  }

  private drawInitial() {
    this.ctx.fillStyle = '#020617';
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.drawStars();
  }

  private draw() {
    this.ctx.fillStyle = '#020617';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    this.drawStars();
    
    // Draw Particles
    for (const p of this.particles) {
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.life / p.maxLife;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 2.5, 0, Math.PI*2);
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1.0;
    
    // Draw Bullets
    for (const b of this.bullets) {
      this.ctx.fillStyle = b.color;
      this.ctx.shadowBlur = 12;
      this.ctx.shadowColor = b.color;
      this.ctx.fillRect(b.x - b.w/2, b.y - b.h/2, b.w, b.h);
      this.ctx.shadowBlur = 0;
    }
    
    // Draw Enemies
    for (const e of this.enemies) {
      if (e.type === 'asteroid') {
        this.ctx.fillStyle = e.color;
        this.ctx.beginPath();
        // Rough octagon shape for asteroid
        for (let i=0; i<8; i++) {
          const a = (i/8) * Math.PI * 2;
          const r = e.w/2 * (0.8 + 0.2*Math.sin(i * 1234.5 + e.x)); // fake randomness
          const px = e.x + Math.cos(a) * r;
          const py = e.y + Math.sin(a) * r;
          if (i===0) this.ctx.moveTo(px,py); else this.ctx.lineTo(px,py);
        }
        this.ctx.fill();
        // Craters
        this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
        this.ctx.beginPath(); this.ctx.arc(e.x - e.w/6, e.y - e.w/6, e.w/6, 0, Math.PI*2); this.ctx.fill();
      } else {
        // Enemy Ship
        this.ctx.fillStyle = e.color;
        this.ctx.beginPath();
        this.ctx.moveTo(e.x, e.y + e.h/2); // nose pointing down
        this.ctx.lineTo(e.x - e.w/2, e.y - e.h/2);
        this.ctx.lineTo(e.x, e.y - e.h/4);
        this.ctx.lineTo(e.x + e.w/2, e.y - e.h/2);
        this.ctx.fill();
      }
    }
    
    // Draw Player
    if (this.isPlaying()) {
      this.ctx.fillStyle = this.player.color;
      this.ctx.beginPath();
      this.ctx.moveTo(this.player.x, this.player.y - this.player.h/2); // nose
      this.ctx.lineTo(this.player.x - this.player.w/2, this.player.y + this.player.h/2); // left wing
      this.ctx.lineTo(this.player.x, this.player.y + this.player.h/4); // engine curve
      this.ctx.lineTo(this.player.x + this.player.w/2, this.player.y + this.player.h/2); // right wing
      this.ctx.fill();
      
      // Engine exhaust
      this.ctx.fillStyle = '#f59e0b';
      this.ctx.beginPath();
      this.ctx.moveTo(this.player.x - 8, this.player.y + this.player.h/4);
      this.ctx.lineTo(this.player.x + 8, this.player.y + this.player.h/4);
      this.ctx.lineTo(this.player.x, this.player.y + this.player.h/2 + Math.random()*20); // flickering exhaust
      this.ctx.fill();
    }
  }
  
  private drawStars() {
    this.ctx.fillStyle = '#ffffff';
    for (const star of this.stars) {
      this.ctx.globalAlpha = star.size / 3;
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.size, 0, Math.PI*2);
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1.0;
  }
}
