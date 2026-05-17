import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, HostListener, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Point { x: number; y: number; }

@Component({
  selector: 'app-snake-and-eggs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fullscreen-container" [class.flash-red]="showFlash()">
      <canvas #gameCanvas width="400" height="400"
              (touchstart)="onTouchStart($event)"
              (touchend)="onTouchEnd($event)"></canvas>

      <div class="hud" *ngIf="isPlaying()">
        <div class="hud-stats">
          <span>Score: <span class="score-value">{{ score() }}</span></span>
        </div>
        <button class="btn-exit" (click)="exitGame()">Exit Game</button>
      </div>

      <!-- Mobile D-pad -->
      <div class="mobile-controls" *ngIf="isMobile() && isPlaying()">
        <button class="ctrl-btn up" (touchstart)="setDirection(0, -1); $event.preventDefault();">▲</button>
        <div class="ctrl-row">
          <button class="ctrl-btn left" (touchstart)="setDirection(-1, 0); $event.preventDefault();">◀</button>
          <button class="ctrl-btn right" (touchstart)="setDirection(1, 0); $event.preventDefault();">▶</button>
        </div>
        <button class="ctrl-btn down" (touchstart)="setDirection(0, 1); $event.preventDefault();">▼</button>
      </div>
      
      <div class="menu-overlay" *ngIf="!isPlaying()">
        <h2>🐍🥚 Snake n Eggs</h2>
        <p *ngIf="!gameOver()">
          Eat the eggs to grow! {{ isMobile() ? 'Swipe or tap D-pad to move.' : 'Use Arrow Keys or WASD to move.' }}
        </p>
        
        <div *ngIf="gameOver()" class="game-over-text">Game Over!</div>
        
        <div class="menu-buttons">
          <button class="btn-primary" (click)="startGame()">
            {{ gameOver() ? 'Restart Game' : 'Start Game' }}
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
      display: flex; flex-direction: column; justify-content: center; align-items: center;
      transition: background-color 0.1s;
      gap: 1rem;
    }
    
    .flash-red { animation: flashRed 0.5s ease-out; }
    @keyframes flashRed { 0% { background-color: rgba(255, 0, 0, 0.6); } 100% { background-color: #0f172a; } }
    
    canvas {
      background-color: rgba(20, 20, 30, 0.5);
      box-shadow: 0 10px 30px rgba(0,0,0,0.5); display: block;
      max-width: 95vw; max-height: 50vh; object-fit: contain;
      border-radius: 12px;
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
    .score-value { color: var(--accent-pink); }
    
    .btn-exit {
      pointer-events: auto; padding: 0.75rem 1.5rem; border-radius: 8px; font-size: 1.1rem;
      background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2);
      cursor: pointer; font-weight: bold; transition: all 0.2s;
    }
    .btn-exit:hover { background: rgba(255,255,255,0.2); }
    
    .menu-overlay {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: rgba(15, 23, 42, 0.9); padding: 2.5rem; border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.1); text-align: center;
      display: flex; flex-direction: column; gap: 1.5rem; align-items: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); z-index: 10000;
      width: 90%; max-width: 400px;
    }
    
    .menu-overlay h2 { font-size: 2.5rem; margin: 0; color: white; }
    .menu-overlay p { font-size: 1.1rem; color: #94a3b8; margin: 0; }
    
    .game-over-text { color: #ff4b4b; font-weight: bold; font-size: 2.5rem; text-transform: uppercase; text-shadow: 0 4px 8px rgba(0,0,0,0.5); }
    
    .menu-buttons { display: flex; gap: 1rem; margin-top: 1rem; }
    .btn-primary {
      padding: 1rem 2rem; font-size: 1.2rem; border-radius: 8px; font-weight: 600;
      cursor: pointer; border: none; background: var(--accent-pink); color: white;
      transition: transform 0.2s, opacity 0.2s;
    }
    .btn-primary:hover { opacity: 0.9; transform: scale(1.05); }
 
    .btn-secondary {
      padding: 0.75rem 1.5rem; font-size: 1.1rem; border-radius: 8px; font-weight: 600;
      cursor: pointer; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: white;
      transition: all 0.2s; display: flex; align-items: center; gap: 0.5rem;
    }
    .btn-secondary:hover { background: rgba(255,255,255,0.2); transform: translateY(-2px); }

    /* Mobile D-pad Styles */
    .mobile-controls {
      display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
      margin-top: 0.5rem; z-index: 10000;
    }
    .ctrl-row {
      display: flex; gap: 2.5rem;
    }
    .ctrl-btn {
      width: 60px; height: 60px; border-radius: 50%;
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: white; font-size: 1.5rem; font-weight: bold;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 0 15px rgba(236, 72, 153, 0.1);
      cursor: pointer;
      user-select: none;
      -webkit-user-select: none;
      transition: all 0.1s ease;
    }
    .ctrl-btn:active {
      transform: scale(0.9);
      background: rgba(236, 72, 153, 0.2);
      border-color: #ec4899;
      box-shadow: 0 0 25px rgba(236, 72, 153, 0.4);
    }
  `]
})
export class SnakeAndEggsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('gameCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private router = inject(Router);
  
  score = signal(0);
  isPlaying = signal(false);
  gameOver = signal(false);
  showFlash = signal(false);
  isMobile = signal(false);
  
  private ctx!: CanvasRenderingContext2D;
  private gridSize = 20;
  private tileCount = 20; // 400px / 20px
  
  private snake: Point[] = [];
  private velocity: Point = { x: 0, y: 0 };
  private egg: Point = { x: 10, y: 10 };
  private nextVelocity: Point = { x: 0, y: 0 };
  
  private gameLoopId: any;
  private baseSpeed = 150; // ms

  // Touch Swipe Gesture State
  private touchStartX = 0;
  private touchStartY = 0;

  constructor() {
    this.checkDevice();
  }

  @HostListener('window:resize')
  checkDevice() {
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const isSmallScreen = window.innerWidth <= 768;
    this.isMobile.set(isTouch || isSmallScreen);
  }

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

  // Handle Swipes
  onTouchStart(event: TouchEvent) {
    if (!this.isPlaying()) return;
    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
  }

  onTouchEnd(event: TouchEvent) {
    if (!this.isPlaying()) return;
    const diffX = event.changedTouches[0].clientX - this.touchStartX;
    const diffY = event.changedTouches[0].clientY - this.touchStartY;
    
    // Swipe threshold of 30 pixels
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (Math.abs(diffX) > 30) {
        if (diffX > 0) {
          this.setDirection(1, 0); // Right
        } else {
          this.setDirection(-1, 0); // Left
        }
      }
    } else {
      if (Math.abs(diffY) > 30) {
        if (diffY > 0) {
          this.setDirection(0, 1); // Down
        } else {
          this.setDirection(0, -1); // Up
        }
      }
    }
  }

  setDirection(x: number, y: number) {
    if (!this.isPlaying()) return;
    // Prevent immediate 180-degree turns
    if (x !== 0 && this.velocity.x === -x) return;
    if (y !== 0 && this.velocity.y === -y) return;
    this.nextVelocity = { x, y };
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (!this.isPlaying()) return;
    
    switch (event.key) {
      case 'ArrowUp':
      case 'w':
        this.setDirection(0, -1);
        event.preventDefault();
        break;
      case 'ArrowDown':
      case 's':
        this.setDirection(0, 1);
        event.preventDefault();
        break;
      case 'ArrowLeft':
      case 'a':
        this.setDirection(-1, 0);
        event.preventDefault();
        break;
      case 'ArrowRight':
      case 'd':
        this.setDirection(1, 0);
        event.preventDefault();
        break;
    }
  }

  startGame() {
    this.snake = [
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 }
    ];
    this.velocity = { x: 0, y: -1 };
    this.nextVelocity = { x: 0, y: -1 };
    this.score.set(0);
    this.spawnEgg();
    
    this.showFlash.set(false);
    this.isPlaying.set(true);
    this.gameOver.set(false);
    
    this.stopGameLoop();
    this.startGameLoop();
  }

  private startGameLoop() {
    this.gameLoopId = setInterval(() => {
      this.update();
      this.draw();
    }, this.baseSpeed);
  }

  private stopGameLoop() {
    if (this.gameLoopId) {
      clearInterval(this.gameLoopId);
    }
  }

  private update() {
    this.velocity = { ...this.nextVelocity };
    
    const head = { 
      x: this.snake[0].x + this.velocity.x, 
      y: this.snake[0].y + this.velocity.y 
    };

    // Check Wall Collision
    if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
      this.handleGameOver(true);
      return;
    }

    // Check Self Collision
    for (let i = 0; i < this.snake.length; i++) {
      if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
        this.handleGameOver(false);
        return;
      }
    }

    this.snake.unshift(head);

    // Check Egg Collision
    if (head.x === this.egg.x && head.y === this.egg.y) {
      this.score.update(s => s + 10);
      this.spawnEgg();
      // Increase speed slightly
      if (this.baseSpeed > 50) {
        this.baseSpeed -= 2;
        this.stopGameLoop();
        this.startGameLoop();
      }
    } else {
      this.snake.pop();
    }
  }

  private drawInitialState() {
    this.ctx.fillStyle = 'rgba(20, 20, 30, 0.5)';
    this.ctx.fillRect(0, 0, 400, 400);
  }

  private draw() {
    // Clear canvas
    this.ctx.clearRect(0, 0, 400, 400);

    // Draw Egg
    this.ctx.fillStyle = 'white';
    this.ctx.beginPath();
    const eggX = this.egg.x * this.gridSize + this.gridSize / 2;
    const eggY = this.egg.y * this.gridSize + this.gridSize / 2;
    this.ctx.ellipse(eggX, eggY, this.gridSize/2 - 2, this.gridSize/2 - 4, 0, 0, 2 * Math.PI);
    this.ctx.fill();

    // Draw Snake
    this.ctx.fillStyle = '#ec4899'; // accent pink
    this.snake.forEach((segment, index) => {
      this.ctx.fillRect(
        segment.x * this.gridSize + 1, 
        segment.y * this.gridSize + 1, 
        this.gridSize - 2, 
        this.gridSize - 2
      );
      
      // Draw eyes on head
      if (index === 0) {
        this.ctx.fillStyle = 'white';
        // simplified eye logic
        this.ctx.fillRect(segment.x * this.gridSize + 4, segment.y * this.gridSize + 4, 4, 4);
        this.ctx.fillRect(segment.x * this.gridSize + 12, segment.y * this.gridSize + 4, 4, 4);
        this.ctx.fillStyle = '#ec4899'; // reset color
      }
    });
  }

  private spawnEgg() {
    let newEgg: Point;
    let collision: boolean;
    do {
      collision = false;
      newEgg = {
        x: Math.floor(Math.random() * this.tileCount),
        y: Math.floor(Math.random() * this.tileCount)
      };
      for (let segment of this.snake) {
        if (segment.x === newEgg.x && segment.y === newEgg.y) {
          collision = true;
          break;
        }
      }
    } while (collision);
    this.egg = newEgg;
  }

  private handleGameOver(isWallCollision: boolean) {
    this.isPlaying.set(false);
    this.gameOver.set(true);
    this.stopGameLoop();
    this.baseSpeed = 150; // reset speed
    
    if (isWallCollision) {
      this.showFlash.set(true);
      // Remove class after animation to allow it to trigger again later
      setTimeout(() => this.showFlash.set(false), 500);
    }
  }
}
