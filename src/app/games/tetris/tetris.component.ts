import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, HostListener, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

const COLORS = [
  null,
  '#00ffff', // I - cyan
  '#0000ff', // J - blue
  '#ffa500', // L - orange
  '#ffff00', // O - yellow
  '#00ff00', // S - green
  '#800080', // T - purple
  '#ff0000'  // Z - red
];

// Shapes are defined as matrices of numbers corresponding to COLORS index
const SHAPES = [
  [], // 0 placeholder
  // I
  [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ],
  // J
  [
    [2, 0, 0],
    [2, 2, 2],
    [0, 0, 0]
  ],
  // L
  [
    [0, 0, 3],
    [3, 3, 3],
    [0, 0, 0]
  ],
  // O
  [
    [4, 4],
    [4, 4]
  ],
  // S
  [
    [0, 5, 5],
    [5, 5, 0],
    [0, 0, 0]
  ],
  // T
  [
    [0, 6, 0],
    [6, 6, 6],
    [0, 0, 0]
  ],
  // Z
  [
    [7, 7, 0],
    [0, 7, 7],
    [0, 0, 0]
  ]
];

interface Piece {
  x: number;
  y: number;
  shape: number[][];
  typeId: number;
}

@Component({
  selector: 'app-tetris',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fullscreen-container">
      <div class="game-area">
        <canvas #gameCanvas [width]="COLS * BLOCK_SIZE" [height]="ROWS * BLOCK_SIZE"></canvas>
      </div>

      <div class="hud">
        <div class="hud-stats">
          <div class="hud-box">
            <span>Score</span>
            <strong>{{ score() }}</strong>
          </div>
          <div class="hud-box">
            <span>Lines</span>
            <strong>{{ lines() }}</strong>
          </div>
          <div class="hud-box">
            <span>Level</span>
            <strong>{{ level() }}</strong>
          </div>
          <div class="hud-box">
            <span>Next</span>
            <canvas #nextCanvas width="120" height="120"></canvas>
          </div>
        </div>
        <button class="btn-exit" (click)="exitGame()">Exit Game</button>
      </div>
      
      <div class="menu-overlay" *ngIf="!isPlaying()">
        <h2>🧱 Block Puzzle</h2>
        <p *ngIf="!gameOver()">Use arrow keys to move/rotate, Space to hard drop.</p>
        
        <div *ngIf="gameOver()" class="game-over-text">GAME OVER</div>
        <div *ngIf="gameOver()" class="final-score">Score: {{ score() }}</div>
        
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
    
    .game-area {
      display: flex; justify-content: center; align-items: center;
      height: 100vh;
    }
    
    .game-area canvas {
      background: #111827; box-shadow: inset 0 0 20px rgba(0,0,0,0.8), 0 10px 30px rgba(0,0,0,0.5); 
      display: block; max-height: 95vh; max-width: 95vw; object-fit: contain;
    }
    
    .hud {
      position: absolute; top: 1.5rem; left: 1.5rem; right: 1.5rem;
      display: flex; justify-content: space-between; align-items: flex-start;
      z-index: 10000; pointer-events: none;
    }
    .hud-stats {
      display: flex; flex-direction: column; gap: 1rem;
    }
    .hud-box {
      background: rgba(0,0,0,0.5); padding: 1rem; border-radius: 8px;
      display: flex; flex-direction: column; align-items: center;
      border: 1px solid rgba(255,255,255,0.1); pointer-events: auto;
    }
    .hud-box span { color: var(--text-secondary); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; }
    .hud-box strong { color: var(--text-primary); font-size: 1.8rem; font-family: monospace; }
    
    .hud-box canvas { background: transparent; }
    
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
      pointer-events: auto;
    }
    
    .menu-overlay h2 { font-size: 3rem; margin: 0; color: white; }
    .menu-overlay p { font-size: 1.2rem; color: #94a3b8; margin: 0; }
    
    .game-over-text { color: #ef4444; font-weight: bold; font-size: 3rem; text-shadow: 0 4px 8px rgba(0,0,0,0.8); letter-spacing: 4px; }
    .final-score { color: #fbbf24; font-size: 1.5rem; font-weight: bold; }
    
    .menu-buttons { display: flex; gap: 1rem; margin-top: 1rem; }
    .btn-primary {
      padding: 1rem 2rem; font-size: 1.2rem; border-radius: 8px; font-weight: 600;
      cursor: pointer; border: none; background: var(--accent-pink, #ec4899); color: white;
      transition: transform 0.2s, opacity 0.2s; text-transform: uppercase; letter-spacing: 1px;
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
export class TetrisComponent implements AfterViewInit, OnDestroy {
  @ViewChild('gameCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('nextCanvas') nextCanvasRef!: ElementRef<HTMLCanvasElement>;
  private router = inject(Router);
  
  COLS = COLS;
  ROWS = ROWS;
  BLOCK_SIZE = BLOCK_SIZE;
  
  score = signal(0);
  lines = signal(0);
  level = signal(1);
  isPlaying = signal(false);
  gameOver = signal(false);
  
  private ctx!: CanvasRenderingContext2D;
  private nextCtx!: CanvasRenderingContext2D;
  
  private board: number[][] = [];
  private activePiece!: Piece;
  private nextPiece!: Piece;
  
  private gameLoopId: any;
  private lastTime = 0;
  private dropCounter = 0;
  private dropInterval = 1000;

  ngAfterViewInit() {
    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
    this.nextCtx = this.nextCanvasRef.nativeElement.getContext('2d')!;
    this.initBoard();
    this.draw();
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
    
    switch (e.key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        this.move(-1, 0);
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        this.move(1, 0);
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        this.move(0, 1);
        break;
      case 'ArrowUp':
      case 'w':
      case 'W':
        this.rotate();
        break;
      case ' ':
        this.hardDrop();
        break;
    }
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) {
      e.preventDefault();
    }
  }

  startGame() {
    this.initBoard();
    this.score.set(0);
    this.lines.set(0);
    this.level.set(1);
    this.dropInterval = 1000;
    this.gameOver.set(false);
    this.isPlaying.set(true);
    
    this.nextPiece = this.spawnPiece();
    this.activePiece = this.spawnPiece();
    
    this.lastTime = performance.now();
    this.dropCounter = 0;
    this.startGameLoop();
  }

  private initBoard() {
    this.board = Array(ROWS).fill(0).map(() => Array(COLS).fill(0));
  }

  private spawnPiece(): Piece {
    const typeId = Math.floor(Math.random() * 7) + 1;
    const shape = SHAPES[typeId];
    return {
      x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2),
      y: 0,
      shape: shape,
      typeId: typeId
    };
  }

  private startGameLoop() {
    this.stopGameLoop();
    
    const loop = (time: number) => {
      const deltaTime = time - this.lastTime;
      this.lastTime = time;
      this.dropCounter += deltaTime;
      
      if (this.dropCounter > this.dropInterval) {
        this.move(0, 1);
        this.dropCounter = 0;
      }
      
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

  private move(dx: number, dy: number) {
    this.activePiece.x += dx;
    this.activePiece.y += dy;
    
    if (this.checkCollision()) {
      this.activePiece.x -= dx;
      this.activePiece.y -= dy;
      
      if (dy > 0) {
        this.lockPiece();
      }
    }
  }

  private rotate() {
    const shape = this.activePiece.shape;
    const N = shape.length;
    // Transpose and reverse rows (rotate 90 deg clockwise)
    const newShape = Array(N).fill(0).map(() => Array(N).fill(0));
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        newShape[x][N - 1 - y] = shape[y][x];
      }
    }
    
    const oldShape = this.activePiece.shape;
    this.activePiece.shape = newShape;
    
    // Wall kick
    if (this.checkCollision()) {
      this.activePiece.x++;
      if (this.checkCollision()) {
        this.activePiece.x -= 2;
        if (this.checkCollision()) {
          this.activePiece.x++;
          this.activePiece.shape = oldShape; // Revert if fails
        }
      }
    }
  }

  private hardDrop() {
    while (!this.checkCollision()) {
      this.activePiece.y++;
    }
    this.activePiece.y--;
    this.lockPiece();
    this.dropCounter = 0;
  }

  private checkCollision(): boolean {
    const shape = this.activePiece.shape;
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] !== 0) {
          const boardX = this.activePiece.x + x;
          const boardY = this.activePiece.y + y;
          
          if (boardX < 0 || boardX >= COLS || boardY >= ROWS || (boardY >= 0 && this.board[boardY][boardX] !== 0)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private lockPiece() {
    const shape = this.activePiece.shape;
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] !== 0) {
          const boardY = this.activePiece.y + y;
          if (boardY < 0) {
            // Game Over
            this.gameOver.set(true);
            this.isPlaying.set(false);
            return;
          }
          this.board[boardY][this.activePiece.x + x] = shape[y][x];
        }
      }
    }
    
    this.clearLines();
    this.activePiece = this.nextPiece;
    this.nextPiece = this.spawnPiece();
    
    if (this.checkCollision()) {
      this.gameOver.set(true);
      this.isPlaying.set(false);
    }
  }

  private clearLines() {
    let linesCleared = 0;
    
    outer: for (let y = ROWS - 1; y >= 0; y--) {
      for (let x = 0; x < COLS; x++) {
        if (this.board[y][x] === 0) {
          continue outer;
        }
      }
      
      // Line is full
      const row = this.board.splice(y, 1)[0].fill(0);
      this.board.unshift(row);
      linesCleared++;
      y++; // Check same row again
    }
    
    if (linesCleared > 0) {
      const lineScores = [0, 40, 100, 300, 1200];
      this.score.update(s => s + lineScores[linesCleared] * this.level());
      this.lines.update(l => l + linesCleared);
      
      if (this.lines() >= this.level() * 10) {
        this.level.update(l => l + 1);
        this.dropInterval = Math.max(100, 1000 - (this.level() - 1) * 100);
      }
    }
  }

  private draw() {
    // Draw Main Board
    this.ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
    
    // Draw Grid (Optional, makes it look nicer)
    this.ctx.strokeStyle = '#1f2937';
    this.ctx.lineWidth = 1;
    for (let r = 0; r <= ROWS; r++) { this.ctx.beginPath(); this.ctx.moveTo(0, r*BLOCK_SIZE); this.ctx.lineTo(COLS*BLOCK_SIZE, r*BLOCK_SIZE); this.ctx.stroke(); }
    for (let c = 0; c <= COLS; c++) { this.ctx.beginPath(); this.ctx.moveTo(c*BLOCK_SIZE, 0); this.ctx.lineTo(c*BLOCK_SIZE, ROWS*BLOCK_SIZE); this.ctx.stroke(); }
    
    // Draw locked blocks
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (this.board[r][c] !== 0) {
          this.drawBlock(this.ctx, c, r, COLORS[this.board[r][c]]!);
        }
      }
    }
    
    // Draw active piece
    if (this.activePiece) {
      const shape = this.activePiece.shape;
      
      // Draw Ghost Piece
      let ghostY = this.activePiece.y;
      while (!this.checkCollisionWithGivenY(ghostY + 1)) { ghostY++; }
      
      this.ctx.globalAlpha = 0.2;
      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x] !== 0) {
            this.drawBlock(this.ctx, this.activePiece.x + x, ghostY + y, COLORS[shape[y][x]]!);
          }
        }
      }
      this.ctx.globalAlpha = 1.0;

      // Draw real piece
      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x] !== 0) {
            this.drawBlock(this.ctx, this.activePiece.x + x, this.activePiece.y + y, COLORS[shape[y][x]]!);
          }
        }
      }
    }
    
    // Draw Next Piece
    this.nextCtx.clearRect(0, 0, 120, 120);
    if (this.nextPiece) {
      const shape = this.nextPiece.shape;
      const offset = (120 - shape.length * BLOCK_SIZE) / 2;
      
      this.nextCtx.save();
      this.nextCtx.translate(offset, offset);
      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x] !== 0) {
            this.drawBlock(this.nextCtx, x, y, COLORS[shape[y][x]]!);
          }
        }
      }
      this.nextCtx.restore();
    }
  }
  
  private checkCollisionWithGivenY(testY: number): boolean {
    const shape = this.activePiece.shape;
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] !== 0) {
          const boardX = this.activePiece.x + x;
          const boardY = testY + y;
          if (boardX < 0 || boardX >= COLS || boardY >= ROWS || (boardY >= 0 && this.board[boardY][boardX] !== 0)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private drawBlock(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    
    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath(); ctx.moveTo(x*BLOCK_SIZE, y*BLOCK_SIZE); ctx.lineTo(x*BLOCK_SIZE+BLOCK_SIZE, y*BLOCK_SIZE); ctx.lineTo(x*BLOCK_SIZE+BLOCK_SIZE-4, y*BLOCK_SIZE+4); ctx.lineTo(x*BLOCK_SIZE+4, y*BLOCK_SIZE+4); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x*BLOCK_SIZE, y*BLOCK_SIZE); ctx.lineTo(x*BLOCK_SIZE, y*BLOCK_SIZE+BLOCK_SIZE); ctx.lineTo(x*BLOCK_SIZE+4, y*BLOCK_SIZE+BLOCK_SIZE-4); ctx.lineTo(x*BLOCK_SIZE+4, y*BLOCK_SIZE+4); ctx.fill();
    
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.moveTo(x*BLOCK_SIZE, y*BLOCK_SIZE+BLOCK_SIZE); ctx.lineTo(x*BLOCK_SIZE+BLOCK_SIZE, y*BLOCK_SIZE+BLOCK_SIZE); ctx.lineTo(x*BLOCK_SIZE+BLOCK_SIZE-4, y*BLOCK_SIZE+BLOCK_SIZE-4); ctx.lineTo(x*BLOCK_SIZE+4, y*BLOCK_SIZE+BLOCK_SIZE-4); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x*BLOCK_SIZE+BLOCK_SIZE, y*BLOCK_SIZE); ctx.lineTo(x*BLOCK_SIZE+BLOCK_SIZE, y*BLOCK_SIZE+BLOCK_SIZE); ctx.lineTo(x*BLOCK_SIZE+BLOCK_SIZE-4, y*BLOCK_SIZE+BLOCK_SIZE-4); ctx.lineTo(x*BLOCK_SIZE+BLOCK_SIZE-4, y*BLOCK_SIZE+4); ctx.fill();
    
    // Border
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
  }
}
