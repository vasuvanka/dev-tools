import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, HostListener, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Entity {
  id: number;
  type: 'player' | 'goomba' | 'pipe' | 'coin' | 'pit';
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  markedForDeletion: boolean;
  collected?: boolean;
}

const GRAVITY = 0.6;
const JUMP_FORCE = -12;
const WIDTH = 800;
const HEIGHT = 400;
const GROUND_Y = 320;

@Component({
  selector: 'app-mario-runner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fullscreen-container">
      <canvas #gameCanvas [width]="WIDTH" [height]="HEIGHT"
        (touchstart)="onTouchStart($event)"></canvas>

      <div class="hud" *ngIf="isPlaying()">
        <div class="hud-stats">
          <span>Score: <span class="score-value">{{ score() }}</span></span>
          <span class="coins-text">🟡 {{ coins() }}</span>
        </div>
        <button class="btn-exit" (click)="exitGame()">Exit Game</button>
      </div>
      
      <div class="menu-overlay" *ngIf="!isPlaying()">
        <h2>🏃‍♂️ Mario Runner</h2>
        <p *ngIf="!gameOver()">Press Space or Up Arrow to jump. Stomp Goombas, collect coins!</p>
        
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
      background: #0f172a; z-index: 9999; overflow: hidden;
      display: flex; justify-content: center; align-items: center;
    }
    
    canvas {
      background: #5c94fc;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5); display: block;
      max-width: 100vw; max-height: 100vh; object-fit: contain;
    }
    
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
    .score-value { color: #fbbf24; }
    .coins-text { color: #fbbf24; }
    
    .btn-exit {
      pointer-events: auto; padding: 0.75rem 1.5rem; border-radius: 8px; font-size: 1.1rem;
      background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2);
      cursor: pointer; font-weight: bold; transition: all 0.2s;
    }
    .btn-exit:hover { background: rgba(255,255,255,0.2); }
    
    .menu-overlay {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: rgba(15, 23, 42, 0.9); padding: 3rem; border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.1); text-align: center;
      display: flex; flex-direction: column; gap: 1.5rem; align-items: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); z-index: 10000;
    }
    
    .menu-overlay h2 { font-size: 3rem; margin: 0; color: white; }
    .menu-overlay p { font-size: 1.2rem; color: #94a3b8; margin: 0; }
    
    .game-over-text { color: #ef4444; font-weight: bold; font-size: 3rem; text-shadow: 0 4px 8px rgba(0,0,0,0.8); letter-spacing: 4px; }
    .final-score { color: #fbbf24; font-size: 1.5rem; font-weight: bold; }
    
    .menu-buttons { display: flex; gap: 1rem; margin-top: 1rem; }
    .btn-primary {
      padding: 1rem 2rem; font-size: 1.2rem; border-radius: 8px; font-weight: 600;
      cursor: pointer; border: none; background: #e52521; color: white;
      transition: transform 0.2s, opacity 0.2s;
    }
    .btn-primary:hover { opacity: 0.9; transform: scale(1.05); }

    .btn-secondary {
      padding: 0.75rem 1.5rem; font-size: 1.1rem; border-radius: 8px; font-weight: 600;
      cursor: pointer; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: white;
      transition: all 0.2s; display: flex; align-items: center; gap: 0.5rem;
    }
    .btn-secondary:hover { background: rgba(255,255,255,0.2); transform: translateY(-2px); }
  `]
})
export class MarioRunnerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('gameCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private router = inject(Router);
  
  WIDTH = WIDTH;
  HEIGHT = HEIGHT;
  
  score = signal(0);
  coins = signal(0);
  isPlaying = signal(false);
  gameOver = signal(false);
  
  private ctx!: CanvasRenderingContext2D;
  private gameLoopId: any;
  
  private player!: Entity;
  private entities: Entity[] = [];
  
  private scrollSpeed = 5;
  private distance = 0;
  private nextSpawnDist = 0;
  private nextId = 0;
  
  private isJumping = false;
  private jumpHoldTimer = 0;

  ngAfterViewInit() {
    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
    this.drawInitial();
  }

  ngOnDestroy() {
    this.stopGameLoop();
  }

  exitGame() {
    this.stopGameLoop();
    this.router.navigate(['/games']);
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    if (!this.isPlaying()) return;
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      if (!this.isJumping) {
        this.player.vy = JUMP_FORCE;
        this.isJumping = true;
        this.jumpHoldTimer = 10; // allow holding for 10 frames to jump higher
      } else if (this.jumpHoldTimer > 0) {
        this.player.vy -= 1.2; // Extra boost while holding
      }
      e.preventDefault();
    }
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(e: KeyboardEvent) {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      this.jumpHoldTimer = 0; // Cut jump short
    }
  }
  
  onTouchStart(e: TouchEvent) {
    if (!this.isPlaying()) return;
    e.preventDefault();
    if (!this.isJumping) {
      this.player.vy = JUMP_FORCE;
      this.isJumping = true;
      this.jumpHoldTimer = 5; 
    }
  }

  startGame() {
    this.score.set(0);
    this.coins.set(0);
    this.gameOver.set(false);
    this.isPlaying.set(true);
    
    this.scrollSpeed = 5;
    this.distance = 0;
    this.nextSpawnDist = 400;
    this.entities = [];
    
    this.player = {
      id: this.nextId++, type: 'player',
      x: 100, y: GROUND_Y - 40, w: 32, h: 40,
      vx: 0, vy: 0, markedForDeletion: false
    };
    
    this.startGameLoop();
  }

  private startGameLoop() {
    this.stopGameLoop();
    let lastTime = performance.now();
    
    const loop = (time: number) => {
      this.update();
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

  private update() {
    this.distance += this.scrollSpeed;
    this.score.set(Math.floor(this.distance / 10));
    
    // Increase speed slowly
    this.scrollSpeed = 5 + (this.distance / 3000);
    
    // Player Physics
    this.player.vy += GRAVITY;
    this.player.y += this.player.vy;
    
    if (this.jumpHoldTimer > 0) this.jumpHoldTimer--;
    
    // Ground collision
    if (this.player.y >= GROUND_Y - this.player.h) {
      // Check if over a pit
      let overPit = false;
      for (const e of this.entities) {
        if (e.type === 'pit' && this.player.x + this.player.w/2 > e.x && this.player.x + this.player.w/2 < e.x + e.w) {
          overPit = true;
          break;
        }
      }
      
      if (!overPit) {
        this.player.y = GROUND_Y - this.player.h;
        this.player.vy = 0;
        this.isJumping = false;
      }
    }
    
    // Pit death
    if (this.player.y > HEIGHT) {
      this.die();
    }
    
    // Spawning Logic
    if (this.distance > this.nextSpawnDist) {
      this.spawnObstacle();
      // Next spawn between 300 and 600 distance units
      this.nextSpawnDist = this.distance + 300 + Math.random() * 300;
    }
    
    // Update Entities
    for (const e of this.entities) {
      e.x -= this.scrollSpeed;
      
      if (e.type === 'goomba') {
        // Goombas walk slightly faster left
        e.x -= 1;
      }
      
      if (e.x + e.w < 0) {
        e.markedForDeletion = true;
      }
      
      // Collision with player
      if (!e.markedForDeletion && this.checkAABB(this.player, e)) {
        if (e.type === 'coin') {
          e.markedForDeletion = true;
          this.coins.update(c => c + 1);
          this.score.update(s => s + 100);
        } else if (e.type === 'pipe') {
          this.die();
        } else if (e.type === 'goomba') {
          // Check if stomping (player falling and bottom half hitting top half)
          if (this.player.vy > 0 && this.player.y + this.player.h < e.y + e.h/2) {
            e.markedForDeletion = true; // squished
            this.player.vy = JUMP_FORCE * 0.8; // bounce
            this.score.update(s => s + 200);
          } else {
            this.die();
          }
        }
      }
    }
    
    this.entities = this.entities.filter(e => !e.markedForDeletion);
  }
  
  private die() {
    this.gameOver.set(true);
    this.isPlaying.set(false);
  }
  
  private spawnObstacle() {
    const rand = Math.random();
    if (rand < 0.2) {
      // Spawn Pit
      const pitWidth = 80 + Math.random() * 100;
      this.entities.push({
        id: this.nextId++, type: 'pit', x: WIDTH, y: GROUND_Y, w: pitWidth, h: HEIGHT - GROUND_Y,
        vx: 0, vy: 0, markedForDeletion: false
      });
      // Spawn coins over pit
      this.entities.push({
        id: this.nextId++, type: 'coin', x: WIDTH + pitWidth/2 - 10, y: GROUND_Y - 120, w: 20, h: 20,
        vx: 0, vy: 0, markedForDeletion: false
      });
    } else if (rand < 0.5) {
      // Spawn Pipe
      const pipeHeight = 40 + Math.random() * 60;
      this.entities.push({
        id: this.nextId++, type: 'pipe', x: WIDTH, y: GROUND_Y - pipeHeight, w: 40, h: pipeHeight,
        vx: 0, vy: 0, markedForDeletion: false
      });
    } else {
      // Spawn Goomba
      this.entities.push({
        id: this.nextId++, type: 'goomba', x: WIDTH, y: GROUND_Y - 30, w: 30, h: 30,
        vx: 0, vy: 0, markedForDeletion: false
      });
    }
    
    // Random coins occasionally
    if (Math.random() < 0.4 && rand >= 0.2) { // not over pit
      this.entities.push({
        id: this.nextId++, type: 'coin', x: WIDTH + 100, y: GROUND_Y - 100 - Math.random() * 50, w: 20, h: 20,
        vx: 0, vy: 0, markedForDeletion: false
      });
    }
  }
  
  private checkAABB(a: Entity, b: Entity): boolean {
    return a.x < b.x + b.w &&
           a.x + a.w > b.x &&
           a.y < b.y + b.h &&
           a.y + a.h > b.y;
  }

  private drawInitial() {
    this.ctx.fillStyle = '#5c94fc';
    this.ctx.fillRect(0, 0, WIDTH, HEIGHT);
    
    // Draw ground
    this.ctx.fillStyle = '#c84c0c'; // Super Mario ground color
    this.ctx.fillRect(0, GROUND_Y, WIDTH, HEIGHT - GROUND_Y);
  }

  private draw() {
    this.ctx.clearRect(0, 0, WIDTH, HEIGHT);
    
    // Sky
    this.ctx.fillStyle = '#5c94fc';
    this.ctx.fillRect(0, 0, WIDTH, HEIGHT);
    
    // Mountains/Clouds (Parallax background)
    this.ctx.fillStyle = 'rgba(255,255,255,0.7)';
    const cloudOffset = (this.distance * 0.2) % 400;
    this.ctx.beginPath(); this.ctx.arc(200 - cloudOffset, 100, 30, 0, Math.PI*2); this.ctx.arc(230 - cloudOffset, 100, 20, 0, Math.PI*2); this.ctx.arc(170 - cloudOffset, 100, 20, 0, Math.PI*2); this.ctx.fill();
    this.ctx.beginPath(); this.ctx.arc(600 - cloudOffset, 150, 40, 0, Math.PI*2); this.ctx.arc(640 - cloudOffset, 150, 25, 0, Math.PI*2); this.ctx.arc(560 - cloudOffset, 150, 25, 0, Math.PI*2); this.ctx.fill();
    
    // Draw ground blocks
    this.ctx.fillStyle = '#c84c0c';
    this.ctx.fillRect(0, GROUND_Y, WIDTH, HEIGHT - GROUND_Y);
    
    // Ground detail line
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, GROUND_Y, WIDTH, 4);
    
    // Draw Entities
    for (const e of this.entities) {
      if (e.type === 'pit') {
        // Draw sky color over ground to simulate pit
        this.ctx.fillStyle = '#5c94fc';
        this.ctx.fillRect(e.x, GROUND_Y, e.w, e.h);
        // Draw black bottom
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(e.x, HEIGHT - 20, e.w, 20);
      } else if (e.type === 'pipe') {
        // Draw green pipe
        this.ctx.fillStyle = '#00a800';
        this.ctx.fillRect(e.x + 4, e.y + 16, e.w - 8, e.h - 16);
        this.ctx.fillRect(e.x, e.y, e.w, 16); // lip
        // Highlights
        this.ctx.fillStyle = '#8ce68c';
        this.ctx.fillRect(e.x + 8, e.y + 16, 4, e.h - 16);
        this.ctx.fillRect(e.x + 4, e.y, 4, 16);
        // Outlines
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(e.x + 4, e.y + 16, e.w - 8, e.h - 16);
        this.ctx.strokeRect(e.x, e.y, e.w, 16);
      } else if (e.type === 'goomba') {
        // Draw Goomba
        const bounce = Math.sin(this.distance * 0.1) * 2; // waddle animation
        
        this.ctx.fillStyle = '#c84c0c'; // orange/brown body
        this.ctx.beginPath();
        this.ctx.moveTo(e.x + e.w/2, e.y + bounce);
        this.ctx.lineTo(e.x + e.w, e.y + e.h - 4);
        this.ctx.lineTo(e.x, e.y + e.h - 4);
        this.ctx.fill();
        
        // Feet
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(e.x, e.y + e.h - 4, 10, 4);
        this.ctx.fillRect(e.x + e.w - 10, e.y + e.h - 4, 10, 4);
        
        // Eyes
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(e.x + 6, e.y + e.h/2 + bounce, 4, 6);
        this.ctx.fillRect(e.x + e.w - 10, e.y + e.h/2 + bounce, 4, 6);
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(e.x + 8, e.y + e.h/2 + 2 + bounce, 2, 4);
        this.ctx.fillRect(e.x + e.w - 8, e.y + e.h/2 + 2 + bounce, 2, 4);
        
      } else if (e.type === 'coin') {
        // Spinning animation
        const scale = Math.abs(Math.sin(this.distance * 0.05));
        this.ctx.save();
        this.ctx.translate(e.x + e.w/2, e.y + e.h/2);
        this.ctx.scale(scale, 1);
        
        this.ctx.fillStyle = '#fbbf24';
        this.ctx.beginPath(); this.ctx.arc(0, 0, e.w/2, 0, Math.PI*2); this.ctx.fill();
        this.ctx.fillStyle = '#f59e0b';
        this.ctx.beginPath(); this.ctx.arc(0, 0, e.w/2 - 3, 0, Math.PI*2); this.ctx.fill();
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(-2, -6, 4, 12);
        
        this.ctx.restore();
      }
    }
    
    // Draw Player (Mario-like)
    if (this.player && !this.gameOver()) {
      this.ctx.save();
      this.ctx.translate(this.player.x, this.player.y);
      
      // Jumping pose vs running pose
      if (this.isJumping) {
        // Jump pose
        // Hat
        this.ctx.fillStyle = '#e52521';
        this.ctx.fillRect(4, 0, 20, 8);
        // Face
        this.ctx.fillStyle = '#ffcc99';
        this.ctx.fillRect(8, 8, 20, 12);
        // Mustache/Hair
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(20, 12, 10, 4); // mustache
        this.ctx.fillRect(4, 8, 4, 10); // hair back
        // Shirt/Overalls
        this.ctx.fillStyle = '#43b047'; // wait, classic is red shirt blue overalls
        this.ctx.fillStyle = '#e52521';
        this.ctx.fillRect(8, 20, 16, 10);
        this.ctx.fillStyle = '#0000ff';
        this.ctx.fillRect(10, 24, 12, 10);
        // Arm up
        this.ctx.fillStyle = '#e52521';
        this.ctx.fillRect(16, 12, 8, 8);
        this.ctx.fillStyle = '#ffcc99'; // hand
        this.ctx.fillRect(24, 12, 6, 6);
        // Legs spread
        this.ctx.fillStyle = '#0000ff';
        this.ctx.fillRect(6, 30, 8, 6);
        this.ctx.fillRect(18, 30, 8, 6);
        // Shoes
        this.ctx.fillStyle = '#612a0a';
        this.ctx.fillRect(2, 34, 10, 6);
        this.ctx.fillRect(18, 34, 10, 6);
      } else {
        // Run pose
        const runCycle = Math.floor(this.distance / 20) % 3;
        
        // Hat
        this.ctx.fillStyle = '#e52521';
        this.ctx.fillRect(4, 0, 20, 8);
        this.ctx.fillRect(10, 0, 18, 8); // bill
        // Face
        this.ctx.fillStyle = '#ffcc99';
        this.ctx.fillRect(8, 8, 20, 12);
        // Mustache
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(24, 12, 6, 4);
        // Eye
        this.ctx.fillRect(20, 8, 4, 4);
        
        // Body
        this.ctx.fillStyle = '#e52521';
        this.ctx.fillRect(8, 20, 16, 12);
        this.ctx.fillStyle = '#0000ff'; // Overalls
        this.ctx.fillRect(10, 24, 12, 10);
        
        // Arms & Legs based on cycle
        this.ctx.fillStyle = '#612a0a'; // Shoes
        if (runCycle === 0) {
           this.ctx.fillRect(8, 34, 10, 6); // left foot down
           this.ctx.fillRect(18, 30, 10, 6); // right foot back
        } else if (runCycle === 1) {
           this.ctx.fillRect(12, 34, 10, 6); // standing straight
        } else {
           this.ctx.fillRect(4, 30, 10, 6); // left foot forward up
           this.ctx.fillRect(16, 34, 10, 6); // right foot down
        }
      }
      this.ctx.restore();
    }
  }
}
