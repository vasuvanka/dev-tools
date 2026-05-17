import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, HostListener, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

const TILE_SIZE = 40;
const COLS = 20;
const ROWS = 15;

// Tile types
const EMPTY = 0;
const WALL = 1;
const SPIKE = 2;
const RING = 3;
const EXIT = 4;

interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  onGround: boolean;
  color: string;
}

@Component({
  selector: 'app-bounce',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fullscreen-container" [class.flash-red]="showFlash()">
      <canvas #gameCanvas width="800" height="600"></canvas>

      <div class="hud" *ngIf="isPlaying()">
        <div class="hud-stats">
          <span>Rings: <span class="score-value">{{ ringsLeft() }}</span></span>
          <span>Lives: <span class="lives-value">{{ lives() }}</span></span>
          <span>Level: {{ currentLevel() }} / 25</span>
        </div>
        <button class="btn-exit" (click)="exitGame()">Exit Game</button>
      </div>

      <!-- Mobile controls -->
      <div class="mobile-controls" *ngIf="isMobile() && isPlaying()">
        <div class="left-controls">
          <button class="ctrl-btn left" 
                  (touchstart)="keys.left = true; $event.preventDefault();"
                  (touchend)="keys.left = false; $event.preventDefault();">◀</button>
          <button class="ctrl-btn right" 
                  (touchstart)="keys.right = true; $event.preventDefault();"
                  (touchend)="keys.right = false; $event.preventDefault();">▶</button>
        </div>
        <div class="right-controls">
          <button class="ctrl-btn jump" 
                  (touchstart)="keys.up = true; $event.preventDefault();"
                  (touchend)="keys.up = false; $event.preventDefault();">JUMP</button>
        </div>
      </div>
      
      <div class="menu-overlay" *ngIf="!isPlaying()">
        <h2>🔴 Bounce</h2>
        <p *ngIf="!gameWon() && !gameOver()">
          Collect all rings to unlock the exit! {{ isMobile() ? 'Use on-screen controls to roll.' : 'Use Arrow Keys or WASD to move.' }}
        </p>
        
        <div *ngIf="gameWon()" class="game-won-text">You Beat All 25 Levels! 🏆</div>
        <div *ngIf="gameOver()" class="game-over-text">Game Over!</div>
        
        <div class="menu-buttons">
          <button class="btn-primary" (click)="startGame()">
            {{ gameOver() || gameWon() ? 'Play Again' : 'Start Game' }}
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
    }
    
    .flash-red { animation: flashRed 0.5s ease-out; }
    @keyframes flashRed { 0% { background-color: rgba(255, 0, 0, 0.6); } 100% { background-color: #0f172a; } }
    
    canvas {
      background: linear-gradient(180deg, #1e1b4b 0%, #312e81 100%);
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
    .score-value { color: #fbbf24; }
    .lives-value { color: #ef4444; }
    
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
      width: 90%; max-width: 450px;
    }
    
    .menu-overlay h2 { font-size: 2.5rem; margin: 0; color: white; }
    .menu-overlay p { font-size: 1.1rem; color: #94a3b8; margin: 0; }
    
    .game-over-text { color: #ff4b4b; font-weight: bold; font-size: 2.5rem; text-transform: uppercase; text-shadow: 0 4px 8px rgba(0,0,0,0.5); }
    .game-won-text { color: #fbbf24; font-weight: bold; font-size: 2.5rem; text-align: center; text-shadow: 0 4px 8px rgba(0,0,0,0.5); }
    
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

    /* Mobile Controls Styles */
    .mobile-controls {
      position: absolute; bottom: 1.5rem; left: 1rem; right: 1rem;
      display: flex; justify-content: space-between; align-items: center;
      z-index: 10000; pointer-events: none;
    }
    .left-controls, .right-controls {
      display: flex; gap: 1.5rem; pointer-events: auto;
    }
    .ctrl-btn {
      width: 60px; height: 60px; border-radius: 50%;
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: white; font-size: 1.5rem; font-weight: bold;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 0 15px rgba(239, 68, 68, 0.1);
      cursor: pointer;
      user-select: none;
      -webkit-user-select: none;
      transition: all 0.1s ease;
    }
    .ctrl-btn.jump {
      width: 80px; height: 80px;
      font-size: 1rem;
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.15);
      border-color: rgba(59, 130, 246, 0.2);
    }
    .ctrl-btn:active {
      transform: scale(0.9);
      background: rgba(239, 68, 68, 0.2);
      border-color: #ef4444;
      box-shadow: 0 0 25px rgba(239, 68, 68, 0.4);
    }
    .ctrl-btn.jump:active {
      background: rgba(59, 130, 246, 0.25);
      border-color: #3b82f6;
      box-shadow: 0 0 25px rgba(59, 130, 246, 0.45);
    }
  `]
})
export class BounceComponent implements AfterViewInit, OnDestroy {
  @ViewChild('gameCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private router = inject(Router);
  
  currentLevel = signal(1);
  ringsLeft = signal(0);
  lives = signal(3);
  isPlaying = signal(false);
  gameOver = signal(false);
  gameWon = signal(false);
  showFlash = signal(false);
  isMobile = signal(false);
  
  private ctx!: CanvasRenderingContext2D;
  private gameLoopId: any;
  
  // Input state
  keys = { left: false, right: false, up: false };
  
  // Physics config
  private gravity = 0.5;
  private friction = 0.8;
  private jumpPower = -12;
  private moveSpeed = 1.0;
  private maxSpeed = 6;
  
  private player!: Player;
  private map: number[][] = [];
  
  // Fixed levels
  private levelData: number[][][] = [];

  constructor() {
    this.generateLevels();
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

  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    if (!this.isPlaying()) return;
    const key = e.key.toLowerCase();
    if (key === 'arrowleft' || key === 'a') this.keys.left = true;
    if (key === 'arrowright' || key === 'd') this.keys.right = true;
    if (key === 'arrowup' || key === 'w' || key === ' ') this.keys.up = true;
    if (['arrowup','arrowdown','arrowleft','arrowright',' '].includes(key)) e.preventDefault();
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(e: KeyboardEvent) {
    const key = e.key.toLowerCase();
    if (key === 'arrowleft' || key === 'a') this.keys.left = false;
    if (key === 'arrowright' || key === 'd') this.keys.right = false;
    if (key === 'arrowup' || key === 'w' || key === ' ') this.keys.up = false;
  }

  startGame() {
    this.currentLevel.set(1);
    this.lives.set(3);
    this.gameWon.set(false);
    this.gameOver.set(false);
    this.loadLevel(this.currentLevel());
    this.isPlaying.set(true);
    this.startGameLoop();
  }

  private loadLevel(levelNum: number) {
    if (levelNum > 25) {
      this.gameWon.set(true);
      this.isPlaying.set(false);
      this.stopGameLoop();
      return;
    }
    
    // Deep copy level data
    this.map = this.levelData[levelNum - 1].map(row => [...row]);
    
    // Count rings
    let rings = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (this.map[r][c] === RING) rings++;
      }
    }
    this.ringsLeft.set(rings);
    
    this.player = {
      x: 1 * TILE_SIZE + TILE_SIZE / 2,
      y: (ROWS - 3) * TILE_SIZE + TILE_SIZE / 2,
      vx: 0,
      vy: 0,
      radius: 12,
      onGround: false,
      color: '#ef4444' // red bounce ball
    };
    this.keys = { left: false, right: false, up: false };
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

  private die() {
    this.showFlash.set(true);
    setTimeout(() => this.showFlash.set(false), 500);
    
    this.lives.update(l => l - 1);
    if (this.lives() <= 0) {
      this.gameOver.set(true);
      this.isPlaying.set(false);
      this.stopGameLoop();
    } else {
      this.loadLevel(this.currentLevel()); // restart level
    }
  }

  private update() {
    // Horizontal movement
    if (this.keys.left) this.player.vx -= this.moveSpeed;
    if (this.keys.right) this.player.vx += this.moveSpeed;
    
    // Apply friction and speed limit
    this.player.vx *= this.friction;
    if (this.player.vx > this.maxSpeed) this.player.vx = this.maxSpeed;
    if (this.player.vx < -this.maxSpeed) this.player.vx = -this.maxSpeed;
    
    // Jumping
    if (this.keys.up && this.player.onGround) {
      this.player.vy = this.jumpPower;
      this.player.onGround = false;
    }
    
    // Apply gravity
    this.player.vy += this.gravity;
    
    // Move X
    this.player.x += this.player.vx;
    this.checkCollisions(true);
    
    // Move Y
    this.player.y += this.player.vy;
    this.player.onGround = false;
    this.checkCollisions(false);
    
    // Bounds check
    if (this.player.y > ROWS * TILE_SIZE + 100) {
      this.die(); // fell off map
    }
  }

  private checkCollisions(horizontal: boolean) {
    const p = this.player;
    const r = p.radius;
    
    // Determine which tiles the player overlaps
    // Shave a tiny bit off the non-moving axis to prevent snagging on floors/walls
    let startCol, endCol, startRow, endRow;
    
    if (horizontal) {
      startCol = Math.floor((p.x - r) / TILE_SIZE);
      endCol = Math.floor((p.x + r) / TILE_SIZE);
      startRow = Math.floor((p.y - r + 2) / TILE_SIZE);
      endRow = Math.floor((p.y + r - 2) / TILE_SIZE);
    } else {
      startCol = Math.floor((p.x - r + 2) / TILE_SIZE);
      endCol = Math.floor((p.x + r - 2) / TILE_SIZE);
      startRow = Math.floor((p.y - r) / TILE_SIZE);
      endRow = Math.floor((p.y + r) / TILE_SIZE);
    }
    
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        if (row < 0 || row >= ROWS || col < 0 || col >= COLS) continue;
        
        const tile = this.map[row][col];
        if (tile === EMPTY) continue;
        
        // Entity interactions
        if (tile === RING) {
          this.map[row][col] = EMPTY;
          this.ringsLeft.update(r => r - 1);
          continue;
        }
        if (tile === EXIT) {
          if (this.ringsLeft() === 0) {
            // Level complete
            this.currentLevel.update(l => l + 1);
            this.loadLevel(this.currentLevel());
            return;
          }
          continue; // Act like empty space if not open, or could be a wall
        }
        if (tile === SPIKE) {
          // Check tighter collision for spike
          const spikeX = col * TILE_SIZE + TILE_SIZE/2;
          const spikeY = row * TILE_SIZE + TILE_SIZE;
          // distance to spike tip approx
          if (Math.abs(p.x - spikeX) < r + 10 && p.y + r > row * TILE_SIZE + 10) {
            this.die();
            return;
          }
          continue;
        }
        
        // Wall collision
        if (tile === WALL) {
          if (horizontal) {
            if (p.vx > 0) {
              p.x = col * TILE_SIZE - r;
            } else if (p.vx < 0) {
              p.x = col * TILE_SIZE + TILE_SIZE + r;
            }
            p.vx = 0;
          } else {
            if (p.vy > 0) {
              p.y = row * TILE_SIZE - r;
              p.onGround = true;
            } else if (p.vy < 0) {
              p.y = row * TILE_SIZE + TILE_SIZE + r;
            }
            p.vy = 0;
          }
        }
      }
    }
  }

  private drawInitialState() {
    this.ctx.fillStyle = '#1e1b4b';
    this.ctx.fillRect(0, 0, 800, 600);
  }

  private draw() {
    this.ctx.clearRect(0, 0, 800, 600);
    
    // Draw Map
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const tile = this.map[r][c];
        if (tile === EMPTY) continue;
        
        const x = c * TILE_SIZE;
        const y = r * TILE_SIZE;
        
        if (tile === WALL) {
          this.ctx.fillStyle = '#475569';
          this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
          this.ctx.strokeStyle = '#334155';
          this.ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
        } else if (tile === SPIKE) {
          this.ctx.fillStyle = '#ef4444';
          this.ctx.beginPath();
          this.ctx.moveTo(x + TILE_SIZE/2, y);
          this.ctx.lineTo(x + TILE_SIZE, y + TILE_SIZE);
          this.ctx.lineTo(x, y + TILE_SIZE);
          this.ctx.fill();
        } else if (tile === RING) {
          this.ctx.strokeStyle = '#fbbf24';
          this.ctx.lineWidth = 4;
          this.ctx.beginPath();
          this.ctx.arc(x + TILE_SIZE/2, y + TILE_SIZE/2, 10, 0, Math.PI * 2);
          this.ctx.stroke();
          this.ctx.lineWidth = 1;
        } else if (tile === EXIT) {
          this.ctx.fillStyle = this.ringsLeft() === 0 ? '#22c55e' : '#78350f';
          this.ctx.fillRect(x + 5, y, TILE_SIZE - 10, TILE_SIZE);
          if (this.ringsLeft() === 0) {
            // draw open door
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(x + 10, y + 5, TILE_SIZE - 20, TILE_SIZE - 5);
          }
        }
      }
    }
    
    // Draw Player
    if (this.player) {
      this.ctx.fillStyle = this.player.color;
      this.ctx.beginPath();
      this.ctx.arc(this.player.x, this.player.y, this.player.radius, 0, Math.PI * 2);
      this.ctx.fill();
      
      // highlight
      this.ctx.fillStyle = 'rgba(255,255,255,0.4)';
      this.ctx.beginPath();
      this.ctx.arc(this.player.x - 4, this.player.y - 4, this.player.radius/3, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  // --- LEVEL GENERATOR ---

  private generateLevels() {
    this.levelData = [];
    
    // Level 1: Tutorial
    this.levelData.push(this.parseLevel([
      "11111111111111111111",
      "1                  1",
      "1                  1",
      "1                  1",
      "1                  1",
      "1                  1",
      "1                  1",
      "1                  1",
      "1                  1",
      "1        3         1",
      "1       111      4 1",
      "1              11111",
      "1                  1",
      "1                  1",
      "11111111111111111111"
    ]));

    // Level 2: Spikes and Stairs
    this.levelData.push(this.parseLevel([
      "11111111111111111111",
      "1                  1",
      "1                  1",
      "1            3     1",
      "1           111    1",
      "1                  1",
      "1        11        1",
      "1                  1",
      "1     11           1",
      "1                  1",
      "1   3           4  1",
      "1  11         1111 1",
      "1     222 222      1",
      "11111111111111111111",
      "11111111111111111111"
    ]));

    // Level 3: Leap of Faith
    this.levelData.push(this.parseLevel([
      "11111111111111111111",
      "1                  1",
      "1                  1",
      "1                  1",
      "1                  1",
      "1        3         1",
      "1       11         1",
      "1                  1",
      "1                  1",
      "1    11     11   4 1",
      "1 3            111 1",
      "111                1",
      "1    2222222222    1",
      "11111111111111111111",
      "11111111111111111111"
    ]));

    // Level 4: The Tower
    this.levelData.push(this.parseLevel([
      "11111111111111111111",
      "1                  1",
      "1                  1",
      "1           4      1",
      "1         1111     1",
      "1        11        1",
      "1       3          1",
      "1     111          1",
      "1    11            1",
      "1      3           1",
      "1    111           1",
      "1                  1",
      "1     2222222      1",
      "11111111111111111111",
      "11111111111111111111"
    ]));

    // Level 5: The Snake Path
    this.levelData.push(this.parseLevel([
      "11111111111111111111",
      "1                  1",
      "1                  1",
      "1 3              4 1",
      "111 111 111 111 1111",
      "1                  1",
      "1   3              1",
      "1 11111  111  111  1",
      "1                  1",
      "1                  1",
      "1    111   111     1",
      "1                  1",
      "1 11    222   222  1",
      "11111111111111111111",
      "11111111111111111111"
    ]));

    // Levels 6-25: Procedural
    for (let i = 6; i <= 25; i++) {
      this.levelData.push(this.generateProceduralLevel(i));
    }
  }

  private parseLevel(strs: string[]): number[][] {
    return strs.map(row => {
      return row.split('').map(char => {
        if (char === '1') return WALL;
        if (char === '2') return SPIKE;
        if (char === '3') return RING;
        if (char === '4') return EXIT;
        return EMPTY;
      });
    });
  }

  private generateProceduralLevel(levelIndex: number): number[][] {
    const map: number[][] = Array(ROWS).fill(0).map(() => Array(COLS).fill(EMPTY));
    
    // Borders
    for (let c = 0; c < COLS; c++) {
      map[0][c] = WALL;
      map[ROWS - 1][c] = WALL;
      map[ROWS - 2][c] = WALL; // thicker floor
    }
    for (let r = 0; r < ROWS; r++) {
      map[r][0] = WALL;
      map[r][COLS - 1] = WALL;
    }

    // Always keep player spawn clear
    // Start at (1, ROWS-3)

    // Generate random platforms
    const numPlatforms = 5 + Math.floor(levelIndex / 2);
    for (let p = 0; p < numPlatforms; p++) {
      const w = 2 + Math.floor(Math.random() * 4);
      const x = 2 + Math.floor(Math.random() * (COLS - w - 4));
      const y = 3 + Math.floor(Math.random() * (ROWS - 6));
      
      for (let i = 0; i < w; i++) map[y][x + i] = WALL;

      // Add a ring sometimes
      if (Math.random() > 0.3) {
        map[y - 1][x + Math.floor(w/2)] = RING;
      }
      
      // Add spikes based on difficulty
      if (Math.random() < (levelIndex / 50)) {
        map[y - 1][x] = SPIKE;
      }
    }

    // Ensure at least 3 rings
    let ringsCount = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (map[r][c] === RING) ringsCount++;
      }
    }
    while (ringsCount < 3) {
      const x = 2 + Math.floor(Math.random() * (COLS - 4));
      const y = ROWS - 3;
      if (map[y][x] === EMPTY) {
        map[y][x] = RING;
        ringsCount++;
      }
    }

    // Add ground spikes based on difficulty
    const numGroundSpikes = Math.floor(levelIndex / 3);
    for (let i = 0; i < numGroundSpikes; i++) {
      const x = 4 + Math.floor(Math.random() * (COLS - 8));
      if (map[ROWS - 3][x] === EMPTY && map[ROWS - 3][x - 1] !== SPIKE && map[ROWS - 3][x + 1] !== SPIKE) {
        map[ROWS - 3][x] = SPIKE;
      }
    }

    // Exit door at top right
    map[2][COLS - 2] = EXIT;
    map[3][COLS - 2] = WALL;
    map[3][COLS - 3] = WALL;

    return map;
  }
}
