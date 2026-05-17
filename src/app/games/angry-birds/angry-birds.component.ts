import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, HostListener, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Vector { x: number; y: number; }

interface Body {
  id: number;
  type: 'bird' | 'pig' | 'block' | 'ground';
  shape: 'circle' | 'rect';
  x: number; // center x
  y: number; // center y
  vx: number;
  vy: number;
  w: number; // width for rect
  h: number; // height for rect
  r: number; // radius for circle
  mass: number;
  restitution: number;
  isStatic: boolean;
  color: string;
  markedForDeletion: boolean;
}

@Component({
  selector: 'app-angry-birds',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fullscreen-container">
      <canvas #gameCanvas width="800" height="500" 
        (mousedown)="onMouseDown($event)"
        (mousemove)="onMouseMove($event)"
        (window:mouseup)="onMouseUp($event)"
        (touchstart)="onTouchStart($event)"
        (touchmove)="onTouchMove($event)"
        (window:touchend)="onTouchEnd($event)"></canvas>

      <div class="hud" *ngIf="isPlaying()">
        <div class="hud-stats">
          <span>Score: <span class="score-value">{{ score() }}</span></span>
          <span>Birds: <span class="lives-value">{{ birdsLeft() }}</span></span>
          <span>Level: {{ currentLevel() }}</span>
        </div>
        <div class="hud-buttons">
          <button class="btn-secondary" (click)="restartCurrentLevel()">🔄 Restart</button>
          <button class="btn-exit" (click)="exitGame()">Exit Game</button>
        </div>
      </div>
      
      <div class="menu-overlay" *ngIf="!isPlaying()">
        <h2>🐦 Angry Birds</h2>
        <p *ngIf="!gameWon() && !levelComplete() && !gameOver()">Drag the red bird to shoot!</p>
        
        <div *ngIf="gameWon()" class="game-won-text">You Won! 🏆</div>
        <div *ngIf="levelComplete()" class="level-complete-text">Level Cleared!</div>
        <div *ngIf="gameOver()" class="game-over-text">Out of Birds!</div>
        
        <div class="menu-buttons">
          <button class="btn-primary" (click)="nextAction()">
            {{ getActionText() }}
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
      background: linear-gradient(180deg, #87CEEB 0%, #e0f6ff 100%);
      box-shadow: 0 10px 30px rgba(0,0,0,0.5); display: block;
      cursor: crosshair;
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
    .score-value { color: #3b82f6; }
    .lives-value { color: #ef4444; }
    
    .hud-buttons { display: flex; gap: 1rem; pointer-events: auto; }
    
    .btn-exit {
      padding: 0.75rem 1.5rem; border-radius: 8px; font-size: 1.1rem;
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
    
    .game-over-text { color: #ff4b4b; font-weight: bold; font-size: 3rem; text-transform: uppercase; text-shadow: 0 4px 8px rgba(0,0,0,0.5); }
    .level-complete-text { color: #4ade80; font-weight: bold; font-size: 3rem; text-shadow: 0 4px 8px rgba(0,0,0,0.5); }
    .game-won-text { color: #fbbf24; font-weight: bold; font-size: 3rem; text-align: center; text-shadow: 0 4px 8px rgba(0,0,0,0.5); }
    
    .menu-buttons { display: flex; gap: 1rem; margin-top: 1rem; }
    .btn-primary {
      padding: 1rem 2rem; font-size: 1.2rem; border-radius: 8px; font-weight: 600;
      cursor: pointer; border: none; background: var(--accent-blue, #3b82f6); color: white;
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
export class AngryBirdsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('gameCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private router = inject(Router);

  currentLevel = signal(1);
  totalLevels = 4;
  score = signal(0);
  birdsLeft = signal(3);

  isPlaying = signal(false);
  gameOver = signal(false);
  levelComplete = signal(false);
  gameWon = signal(false);

  private ctx!: CanvasRenderingContext2D;
  private gameLoopId: any;
  private nextId = 1;

  private bodies: Body[] = [];

  // Slingshot state
  private slingPos: Vector = { x: 150, y: 350 };
  private slingRadius = 100;
  private isDragging = false;
  private dragPos: Vector = { x: 0, y: 0 };

  private activeBird: Body | null = null;
  private birdQueue = 3;
  private cameraX = 0;

  private gravity = 0.4;
  private frameCount = 0;

  ngAfterViewInit() {
    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
    this.drawInitialState();
  }

  ngOnDestroy() {
    this.stopGameLoop();
  }

  exitGame() {
    this.stopGameLoop();
    this.router.navigate(['/games']);
  }

  nextAction() {
    if (this.gameWon() || this.gameOver()) {
      // Restart whole game
      this.currentLevel.set(1);
      this.score.set(0);
      this.gameWon.set(false);
      this.gameOver.set(false);
      this.loadLevel(this.currentLevel());
    } else if (this.levelComplete()) {
      // Next level
      this.currentLevel.update(l => l + 1);
      this.levelComplete.set(false);
      this.loadLevel(this.currentLevel());
    } else {
      // Start game from beginning (if not playing yet)
      this.loadLevel(this.currentLevel());
    }

    this.isPlaying.set(true);
    this.startGameLoop();
  }

  getActionText(): string {
    if (this.gameWon()) return 'Play Again';
    if (this.gameOver()) return 'Try Again';
    if (this.levelComplete()) return 'Next Level';
    return 'Start Game';
  }

  restartCurrentLevel() {
    this.gameWon.set(false);
    this.gameOver.set(false);
    this.levelComplete.set(false);
    // score should technically be reset to what it was at start of level, 
    // but for simplicity we can just leave it or reset to 0 if we want.
    // Let's reset score to 0 to prevent farming on restart
    this.score.set(0);
    this.loadLevel(this.currentLevel());
    this.isPlaying.set(true);
    this.startGameLoop();
  }

  private loadLevel(levelNum: number) {
    this.bodies = [];
    this.cameraX = 0;
    this.birdQueue = 3;
    this.birdsLeft.set(this.birdQueue);
    this.activeBird = null;

    // Add Ground
    this.bodies.push({
      id: this.nextId++, type: 'ground', shape: 'rect',
      x: 400, y: 475, vx: 0, vy: 0, w: 2000, h: 50, r: 0,
      mass: 0, restitution: 0.2, isStatic: true, color: '#4ade80', markedForDeletion: false
    });

    if (levelNum === 1) {
      // Basic Level
      this.addPig(600, 420);
      this.addBlock(600, 380, 40, 40, true);
    } else if (levelNum === 2) {
      this.addBlock(500, 400, 30, 100, true);
      this.addBlock(650, 400, 30, 100, true);
      this.addPig(575, 420);
      this.addBlock(575, 300, 180, 30, true);
      this.addPig(575, 250);
    } else if (levelNum === 3) {
      this.addBlock(500, 400, 40, 100, true);
      this.addBlock(600, 400, 40, 100, true);
      this.addBlock(700, 400, 40, 100, true);
      this.addBlock(550, 300, 140, 20, true);
      this.addBlock(650, 300, 140, 20, true);
      this.addPig(550, 420);
      this.addPig(650, 420);
      this.addPig(600, 250);
    } else if (levelNum === 4) {
      // Hard level
      this.birdQueue = 4;
      this.birdsLeft.set(4);
      for (let i = 0; i < 3; i++) {
        this.addBlock(450 + i * 100, 400, 30, 100, true);
        this.addPig(500 + i * 100, 420);
      }
      this.addBlock(550, 300, 300, 30, true);
      this.addPig(550, 250);
      this.addBlock(550, 200, 100, 30, true);
      this.addPig(550, 150);
    }

    this.spawnBird();
  }

  private addPig(x: number, y: number) {
    this.bodies.push({
      id: this.nextId++, type: 'pig', shape: 'circle',
      x, y, vx: 0, vy: 0, w: 0, h: 0, r: 20,
      mass: 1, restitution: 0.4, isStatic: false, color: '#22c55e', markedForDeletion: false
    });
  }

  private addBlock(x: number, y: number, w: number, h: number, isStatic: boolean) {
    this.bodies.push({
      id: this.nextId++, type: 'block', shape: 'rect',
      x, y, vx: 0, vy: 0, w, h, r: 0,
      mass: 2, restitution: 0.2, isStatic, color: '#fbbf24', markedForDeletion: false
    });
  }

  private spawnBird() {
    if (this.birdQueue <= 0) return;
    this.birdQueue--;
    this.birdsLeft.set(this.birdQueue);

    this.activeBird = {
      id: this.nextId++, type: 'bird', shape: 'circle',
      x: this.slingPos.x, y: this.slingPos.y, vx: 0, vy: 0, w: 0, h: 0, r: 15,
      mass: 1, restitution: 0.4, isStatic: true, color: '#ef4444', markedForDeletion: false
    };
    this.bodies.push(this.activeBird);
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

  // --- Input Handling ---

  private getCanvasCoords(clientX: number, clientY: number): Vector {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  onMouseDown(e: MouseEvent) {
    if (!this.isPlaying()) return;
    const coords = this.getCanvasCoords(e.clientX, e.clientY);
    this.handleStart(coords.x, coords.y);
  }

  onMouseMove(e: MouseEvent) {
    if (!this.isPlaying()) return;
    const coords = this.getCanvasCoords(e.clientX, e.clientY);
    this.handleMove(coords.x, coords.y);
  }

  onMouseUp(e: MouseEvent) {
    if (!this.isPlaying()) return;
    this.handleEnd();
  }

  onTouchStart(e: TouchEvent) {
    if (!this.isPlaying()) return;
    e.preventDefault();
    const coords = this.getCanvasCoords(e.touches[0].clientX, e.touches[0].clientY);
    this.handleStart(coords.x, coords.y);
  }

  onTouchMove(e: TouchEvent) {
    if (!this.isPlaying()) return;
    e.preventDefault();
    const coords = this.getCanvasCoords(e.touches[0].clientX, e.touches[0].clientY);
    this.handleMove(coords.x, coords.y);
  }

  onTouchEnd(e: TouchEvent) {
    if (!this.isPlaying()) return;
    e.preventDefault();
    this.handleEnd();
  }

  private handleStart(x: number, y: number) {
    if (!this.isPlaying() || !this.activeBird || !this.activeBird.isStatic) return;

    // Check if clicking near bird
    const dx = x - (this.activeBird.x - this.cameraX);
    const dy = y - this.activeBird.y;
    // Increased grab area from 40 to 150 for better UX
    if (Math.sqrt(dx * dx + dy * dy) < 150) {
      this.isDragging = true;
      this.dragPos = { x: x + this.cameraX, y };
    }
  }

  private handleMove(x: number, y: number) {
    if (!this.isDragging || !this.activeBird) return;

    const targetX = x + this.cameraX;
    const targetY = y;

    // Limit drag radius
    const dx = targetX - this.slingPos.x;
    const dy = targetY - this.slingPos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > this.slingRadius) {
      this.dragPos.x = this.slingPos.x + (dx / dist) * this.slingRadius;
      this.dragPos.y = this.slingPos.y + (dy / dist) * this.slingRadius;
    } else {
      this.dragPos.x = targetX;
      this.dragPos.y = targetY;
    }

    this.activeBird.x = this.dragPos.x;
    this.activeBird.y = this.dragPos.y;
  }

  private handleEnd() {
    if (!this.isDragging || !this.activeBird) return;
    this.isDragging = false;

    // Launch bird
    const dx = this.slingPos.x - this.activeBird.x;
    const dy = this.slingPos.y - this.activeBird.y;

    if (Math.sqrt(dx * dx + dy * dy) > 10) {
      this.activeBird.isStatic = false;
      this.activeBird.vx = dx * 0.2;
      this.activeBird.vy = dy * 0.2;
    } else {
      // Reset if barely pulled
      this.activeBird.x = this.slingPos.x;
      this.activeBird.y = this.slingPos.y;
    }
  }

  // --- Physics Update ---

  private update() {
    this.frameCount++;
    let pigsAlive = 0;
    let birdMoving = false;

    // Apply gravity and move
    for (const b of this.bodies) {
      if (b.type === 'pig') pigsAlive++;
      if (b.isStatic) continue;

      b.vy += this.gravity;

      // Apply drag
      b.vx *= 0.99;
      b.vy *= 0.99;

      b.x += b.vx;
      b.y += b.vy;

      if (b.type === 'bird') {
        if (Math.abs(b.vx) > 0.1 || Math.abs(b.vy) > 0.1) birdMoving = true;
        // Camera follow
        if (b.x > 400 && b.x < 1500) {
          this.cameraX = b.x - 400;
        }
      }

      // Ground bounds for loose objects
      if (b.y > 600) b.markedForDeletion = true;
    }

    // Simple Collisions (O(n^2) is fine for < 50 objects)
    for (let i = 0; i < this.bodies.length; i++) {
      for (let j = i + 1; j < this.bodies.length; j++) {
        this.resolveCollision(this.bodies[i], this.bodies[j]);
      }
    }

    // Cleanup marked objects
    for (let i = this.bodies.length - 1; i >= 0; i--) {
      if (this.bodies[i].markedForDeletion) {
        if (this.bodies[i].type === 'pig') {
          this.score.update(s => s + 500);
        }
        if (this.bodies[i].type === 'bird') {
          this.activeBird = null;
        }
        this.bodies.splice(i, 1);
      }
    }

    // Game Logic Checks
    if (pigsAlive === 0 && this.bodies.find(b => b.type === 'pig') === undefined) {
      if (this.currentLevel() >= this.totalLevels) {
        this.gameWon.set(true);
      } else {
        this.levelComplete.set(true);
      }
      this.isPlaying.set(false);
    } else if (!birdMoving && this.activeBird && !this.activeBird.isStatic) {
      // Bird stopped moving
      this.activeBird.markedForDeletion = true;
      this.activeBird = null; // Clear it so we don't trigger this again
      setTimeout(() => {
        if (this.isPlaying()) {
          if (this.birdQueue > 0) {
            this.spawnBird();
            this.cameraX = 0; // reset camera
          } else if (!this.bodies.find(b => b.type === 'bird')) {
            // wait a bit for pigs to stop rolling then check game over
            setTimeout(() => {
              if (this.bodies.find(b => b.type === 'pig')) {
                this.gameOver.set(true);
                this.isPlaying.set(false);
              }
            }, 1000);
          }
        }
      }, 1000);
    }
  }

  // Basic AABB / Circle collision resolution
  private resolveCollision(a: Body, b: Body) {
    if (a.isStatic && b.isStatic) return;
    if (a.markedForDeletion || b.markedForDeletion) return;

    // Circle vs Circle
    if (a.shape === 'circle' && b.shape === 'circle') {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = a.r + b.r;

      if (dist < minDist) {
        // Resolve penetration
        const overlap = minDist - dist;
        const nx = dx / dist;
        const ny = dy / dist;

        const massRatioA = b.isStatic ? 1 : a.mass / (a.mass + b.mass);
        const massRatioB = a.isStatic ? 1 : b.mass / (a.mass + b.mass);

        if (!a.isStatic) { a.x -= nx * overlap * massRatioB; a.y -= ny * overlap * massRatioB; }
        if (!b.isStatic) { b.x += nx * overlap * massRatioA; b.y += ny * overlap * massRatioA; }

        // Resolve velocity
        const kx = a.vx - b.vx;
        const ky = a.vy - b.vy;
        const p = 2.0 * (nx * kx + ny * ky) / (a.mass + b.mass);

        if (!a.isStatic) {
          a.vx = (a.vx - p * a.mass * nx) * a.restitution;
          a.vy = (a.vy - p * a.mass * ny) * a.restitution;
        }
        if (!b.isStatic) {
          b.vx = (b.vx + p * b.mass * nx) * b.restitution;
          b.vy = (b.vy + p * b.mass * ny) * b.restitution;
        }

        // Damage logic
        const impact = Math.sqrt(kx * kx + ky * ky);
        if (impact > 3) {
          if (a.type === 'pig') a.markedForDeletion = true;
          if (b.type === 'pig') b.markedForDeletion = true;
        }
      }
    }
    // Rect vs Rect
    else if (a.shape === 'rect' && b.shape === 'rect') {
      // Basic AABB
      const aLeft = a.x - a.w / 2; const aRight = a.x + a.w / 2;
      const aTop = a.y - a.h / 2; const aBot = a.y + a.h / 2;
      const bLeft = b.x - b.w / 2; const bRight = b.x + b.w / 2;
      const bTop = b.y - b.h / 2; const bBot = b.y + b.h / 2;

      if (aRight > bLeft && aLeft < bRight && aBot > bTop && aTop < bBot) {
        // Find penetration depth
        const overlapX = Math.min(aRight - bLeft, bRight - aLeft);
        const overlapY = Math.min(aBot - bTop, bBot - aTop);

        if (overlapX < overlapY) {
          // Resolve X
          if (a.x < b.x) {
            if (!a.isStatic) { a.x -= overlapX / 2; a.vx *= -a.restitution; }
            if (!b.isStatic) { b.x += overlapX / 2; b.vx *= -b.restitution; }
          } else {
            if (!a.isStatic) { a.x += overlapX / 2; a.vx *= -a.restitution; }
            if (!b.isStatic) { b.x -= overlapX / 2; b.vx *= -b.restitution; }
          }
          // apply friction
          if (!a.isStatic) a.vy *= 0.8;
          if (!b.isStatic) b.vy *= 0.8;
        } else {
          // Resolve Y
          if (a.y < b.y) {
            if (!a.isStatic) { a.y -= overlapY / 2; a.vy *= -a.restitution; }
            if (!b.isStatic) { b.y += overlapY / 2; b.vy *= -b.restitution; }
          } else {
            if (!a.isStatic) { a.y += overlapY / 2; a.vy *= -a.restitution; }
            if (!b.isStatic) { b.y -= overlapY / 2; b.vy *= -b.restitution; }
          }
          // apply friction
          if (!a.isStatic) a.vx *= 0.8;
          if (!b.isStatic) b.vx *= 0.8;
        }

        // Damage
        const impact = Math.abs(a.vx - b.vx) + Math.abs(a.vy - b.vy);
        if (impact > 4) {
          // Turn static blocks dynamic if hit hard
          if (a.type === 'block' && a.isStatic && !b.isStatic) a.isStatic = false;
          if (b.type === 'block' && b.isStatic && !a.isStatic) b.isStatic = false;
        }
      }
    }
    // Circle vs Rect
    else {
      let circle = a.shape === 'circle' ? a : b;
      let rect = a.shape === 'rect' ? a : b;

      const rLeft = rect.x - rect.w / 2; const rRight = rect.x + rect.w / 2;
      const rTop = rect.y - rect.h / 2; const rBot = rect.y + rect.h / 2;

      // Find closest point on rect to circle center
      let testX = circle.x;
      let testY = circle.y;

      if (circle.x < rLeft) testX = rLeft; else if (circle.x > rRight) testX = rRight;
      if (circle.y < rTop) testY = rTop; else if (circle.y > rBot) testY = rBot;

      const dx = circle.x - testX;
      const dy = circle.y - testY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < circle.r) {
        // Collision!
        const overlap = circle.r - dist;
        // nx, ny is normal from rect to circle
        let nx = 0, ny = 0;
        if (dist === 0) {
          // Deep inside, push out based on center difference
          if (Math.abs(circle.x - rect.x) > Math.abs(circle.y - rect.y)) {
            nx = Math.sign(circle.x - rect.x);
          } else {
            ny = Math.sign(circle.y - rect.y);
          }
        } else {
          nx = dx / dist;
          ny = dy / dist;
        }

        if (!circle.isStatic) {
          circle.x += nx * overlap;
          circle.y += ny * overlap;

          // Reflect velocity
          const dot = circle.vx * nx + circle.vy * ny;
          circle.vx = (circle.vx - 2 * dot * nx) * circle.restitution;
          circle.vy = (circle.vy - 2 * dot * ny) * circle.restitution;

          // Friction
          circle.vx *= 0.9;
        }

        if (!rect.isStatic) {
          rect.x -= nx * overlap * 0.5;
          rect.y -= ny * overlap * 0.5;
          rect.vx += nx * Math.abs(circle.vx) * 0.5;
          rect.vy += ny * Math.abs(circle.vy) * 0.5;
        }

        const impact = Math.sqrt(circle.vx * circle.vx + circle.vy * circle.vy);
        if (impact > 4) {
          if (circle.type === 'pig') circle.markedForDeletion = true;
          if (rect.type === 'block' && rect.isStatic) rect.isStatic = false; // block falls
        }
      }
    }
  }

  // --- Rendering ---

  private drawInitialState() {
    this.ctx.fillStyle = '#87CEEB';
    this.ctx.fillRect(0, 0, 800, 500);
  }

  private draw() {
    this.ctx.clearRect(0, 0, 800, 500);

    this.ctx.save();
    this.ctx.translate(-this.cameraX, 0);

    // Draw Slingshot Wood (Back Fork)
    this.ctx.fillStyle = '#612a0a'; // slightly darker for depth
    this.ctx.beginPath();
    this.ctx.moveTo(142, 380);
    this.ctx.lineTo(130, 340);
    this.ctx.lineTo(142, 340);
    this.ctx.lineTo(150, 380);
    this.ctx.fill();

    // Draw Trajectory line
    if (this.isDragging && this.activeBird) {
      const launchVx = (this.slingPos.x - this.activeBird.x) * 0.2;
      const launchVy = (this.slingPos.y - this.activeBird.y) * 0.2;

      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      for (let i = 1; i <= 25; i++) {
        // simulate a few frames ahead (e.g., every 3 frames)
        const t = i * 3;
        const tx = this.activeBird.x + launchVx * t;
        const ty = this.activeBird.y + launchVy * t + 0.5 * this.gravity * t * t;

        // Stop drawing if it hits the ground roughly
        if (ty > 450) break;

        this.ctx.beginPath();
        // Dots get smaller as they go further
        this.ctx.arc(tx, ty, Math.max(1, 4 - i * 0.1), 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    // Draw Slingshot Band (back)
    if (this.isDragging && this.activeBird) {
      this.ctx.strokeStyle = '#451a03';
      this.ctx.lineWidth = 6;
      this.ctx.beginPath();
      this.ctx.moveTo(136, 340);
      this.ctx.lineTo(this.activeBird.x, this.activeBird.y);
      this.ctx.stroke();
    } else if (!this.isDragging && this.activeBird && this.activeBird.isStatic) {
      // Idle band back
      this.ctx.strokeStyle = '#451a03';
      this.ctx.lineWidth = 6;
      this.ctx.beginPath();
      this.ctx.moveTo(136, 340);
      this.ctx.lineTo(this.activeBird.x, this.activeBird.y);
      this.ctx.stroke();
    }

    // Draw bodies
    for (const b of this.bodies) {
      if (b.color === 'transparent') continue;

      if (b.shape === 'rect') {
        this.ctx.fillStyle = b.color;
        this.ctx.fillRect(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h);
        this.ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        this.ctx.strokeRect(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h);
      } else if (b.shape === 'circle') {
        this.ctx.fillStyle = b.color;
        this.ctx.beginPath();
        this.ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        this.ctx.fill();

        if (b.type === 'pig') {
          // pig face
          this.ctx.fillStyle = '#166534';
          this.ctx.beginPath(); this.ctx.arc(b.x - 6, b.y - 4, 3, 0, Math.PI * 2); this.ctx.fill();
          this.ctx.beginPath(); this.ctx.arc(b.x + 6, b.y - 4, 3, 0, Math.PI * 2); this.ctx.fill();
          this.ctx.fillStyle = '#15803d';
          this.ctx.beginPath(); this.ctx.arc(b.x, b.y + 4, 6, 0, Math.PI * 2); this.ctx.fill();
        } else if (b.type === 'bird') {
          // bird face
          this.ctx.fillStyle = '#fff';
          this.ctx.beginPath(); this.ctx.arc(b.x + 4, b.y - 4, 4, 0, Math.PI * 2); this.ctx.fill();
          this.ctx.fillStyle = '#000';
          this.ctx.beginPath(); this.ctx.arc(b.x + 6, b.y - 4, 1.5, 0, Math.PI * 2); this.ctx.fill();
          // beak
          this.ctx.fillStyle = '#f59e0b';
          this.ctx.beginPath(); this.ctx.moveTo(b.x + 6, b.y); this.ctx.lineTo(b.x + 14, b.y + 4); this.ctx.lineTo(b.x + 6, b.y + 6); this.ctx.fill();
        }
      }
    }

    // Draw Slingshot Band (front)
    if (this.isDragging && this.activeBird) {
      this.ctx.strokeStyle = '#78350f';
      this.ctx.lineWidth = 6;
      this.ctx.beginPath();
      this.ctx.moveTo(164, 340);
      this.ctx.lineTo(this.activeBird.x, this.activeBird.y);
      this.ctx.stroke();
    } else if (!this.isDragging && this.activeBird && this.activeBird.isStatic) {
      // Idle band front
      this.ctx.strokeStyle = '#78350f';
      this.ctx.lineWidth = 6;
      this.ctx.beginPath();
      this.ctx.moveTo(164, 340);
      this.ctx.lineTo(this.activeBird.x, this.activeBird.y);
      this.ctx.stroke();
    }

    // Draw Slingshot Wood (Front Fork & Trunk)
    this.ctx.fillStyle = '#78350f';
    this.ctx.strokeStyle = '#451a03';
    this.ctx.lineWidth = 2;
    // Main trunk
    this.ctx.fillRect(142, 380, 16, 70);
    this.ctx.strokeRect(142, 380, 16, 70);
    // Right fork
    this.ctx.beginPath();
    this.ctx.moveTo(158, 380);
    this.ctx.lineTo(170, 340);
    this.ctx.lineTo(158, 340);
    this.ctx.lineTo(150, 380);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.restore();
  }
}
