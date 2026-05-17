import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

type Player = 'X' | 'O' | null;

@Component({
  selector: 'app-tic-tac-toe',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fullscreen-container">
      <div class="hud">
        <button class="btn-exit" (click)="exitGame()">Exit Game</button>
      </div>
      
      <div class="game-layout">
        <div class="header-section glass-section">
          <h2>❌⭕ Tic Tac Toe</h2>
          <p>Play against the AI or a friend locally!</p>
          
          <div class="mode-toggle">
            <button [class.active]="gameMode() === 'PvE'" (click)="setGameMode('PvE')">1 Player (vs AI)</button>
            <button [class.active]="gameMode() === 'PvP'" (click)="setGameMode('PvP')">2 Players (Local)</button>
          </div>
        </div>

        <div class="scoreboard glass-card">
          <div class="score-item">
            <span class="label">{{ gameMode() === 'PvE' ? 'You (X)' : 'Player 1 (X)' }}</span>
            <span class="score player-score">{{ player1Wins() }}</span>
          </div>
          <div class="score-item">
            <span class="label">Draws</span>
            <span class="score draw-score">{{ draws() }}</span>
          </div>
          <div class="score-item">
            <span class="label">{{ gameMode() === 'PvE' ? 'AI (O)' : 'Player 2 (O)' }}</span>
            <span class="score ai-score">{{ player2Wins() }}</span>
          </div>
        </div>

        <div class="board-container glass-card">
          <div class="status-banner" [class.game-over]="gameOver()">
            {{ statusMessage() }}
          </div>
          
          <div class="tic-tac-toe-board">
            <div class="cell" *ngFor="let cell of board(); let i = index"
                 [class.x-cell]="cell === 'X'"
                 [class.o-cell]="cell === 'O'"
                 [class.winning-cell]="winningLine()?.includes(i)"
                 (click)="makeMove(i)">
              {{ cell }}
            </div>
          </div>
          
          <div class="controls">
            <button class="btn-primary" (click)="resetGame()" *ngIf="gameOver()">Play Again</button>
            <button class="btn-secondary" (click)="resetGame()" *ngIf="!gameOver()">Restart Match</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .fullscreen-container {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: #0f172a; z-index: 9999; overflow: auto;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 2rem;
    }
    
    .hud {
      position: absolute; top: 1.5rem; right: 1.5rem;
      z-index: 10000;
    }
    
    .btn-exit {
      padding: 0.75rem 1.5rem; border-radius: 8px; font-size: 1.1rem;
      background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2);
      cursor: pointer; font-weight: bold; transition: all 0.2s;
    }
    .btn-exit:hover { background: rgba(255,255,255,0.2); }
    
    .game-layout { display: flex; flex-direction: column; align-items: center; gap: 2rem; width: 100%; max-width: 800px; margin: auto; }
    
    .header-section { text-align: center; padding: 2rem; border-radius: 16px; width: 100%; background: var(--glass-bg-light); border: 1px solid var(--glass-border-light); }
    .header-section h2 { margin-bottom: 0.5rem; color: white; font-size: 2.5rem; }
    .header-section p { color: #94a3b8; margin: 0 0 1.5rem 0; font-size: 1.2rem; }
    
    .mode-toggle {
      display: inline-flex;
      background: rgba(0,0,0,0.5);
      padding: 0.5rem;
      border-radius: 8px;
      gap: 0.5rem;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .mode-toggle button {
      padding: 0.5rem 1.5rem; border: none; background: transparent; color: #94a3b8;
      cursor: pointer; border-radius: 6px; font-weight: 600; transition: all 0.2s; font-size: 1rem;
    }
    .mode-toggle button.active { background: var(--accent-pink); color: white; box-shadow: 0 2px 8px rgba(236, 72, 153, 0.4); }
    
    .scoreboard {
      display: flex; gap: 3rem; padding: 1.5rem 3rem; border-radius: 16px;
      justify-content: center; width: 100%; max-width: 600px;
      background: var(--glass-bg-light); border: 1px solid var(--glass-border-light);
    }
    .score-item { display: flex; flex-direction: column; align-items: center; }
    .label { font-size: 1rem; color: #94a3b8; margin-bottom: 0.5rem; text-transform: uppercase; font-weight: 600; }
    .score { font-size: 3rem; font-weight: 700; }
    .player-score { color: #ec4899; }
    .ai-score { color: #3b82f6; }
    .draw-score { color: #94a3b8; }
    
    .board-container {
      padding: 2.5rem; border-radius: 16px; display: flex; flex-direction: column;
      align-items: center; background: var(--glass-bg-light); border: 1px solid var(--glass-border-light);
      width: 100%; max-width: 600px;
    }
    
    .status-banner {
      font-size: 1.8rem; font-weight: 600; margin-bottom: 2rem; color: white;
      text-align: center; min-height: 2.5rem; transition: color 0.3s;
    }
    .status-banner.game-over { color: #fbbf24; transform: scale(1.05); }
    
    .tic-tac-toe-board {
      display: grid; grid-template-columns: repeat(3, 120px); gap: 15px; margin-bottom: 2.5rem;
    }
    
    @media (max-width: 500px) {
      .tic-tac-toe-board { grid-template-columns: repeat(3, 90px); gap: 10px; }
      .cell { height: 90px !important; font-size: 3.5rem !important; }
    }
    
    .cell {
      width: 100%; height: 120px; background: rgba(255, 255, 255, 0.05);
      border: 2px solid var(--glass-border-light); border-radius: 12px;
      display: flex; justify-content: center; align-items: center;
      font-size: 4.5rem; font-weight: 700; cursor: pointer; transition: all 0.2s ease;
      font-family: 'Inter', sans-serif; box-shadow: inset 0 4px 6px rgba(0,0,0,0.1);
    }
    .cell:hover:empty { background: rgba(255, 255, 255, 0.1); }
    
    .x-cell { color: #ec4899; text-shadow: 0 0 15px rgba(236, 72, 153, 0.5); cursor: default; }
    .o-cell { color: #3b82f6; text-shadow: 0 0 15px rgba(59, 130, 246, 0.5); cursor: default; }
    
    .winning-cell {
      background: rgba(251, 191, 36, 0.2) !important;
      border-color: #fbbf24 !important;
      transform: scale(1.05);
      z-index: 10;
      box-shadow: 0 0 20px rgba(251, 191, 36, 0.4);
    }
    
    .controls { display: flex; width: 100%; justify-content: center; }
    
    .btn-primary, .btn-secondary {
      padding: 1rem 2.5rem; font-size: 1.1rem; border-radius: 8px; font-weight: 600;
      cursor: pointer; border: none; transition: transform 0.2s, opacity 0.2s;
    }
    .btn-primary { background: var(--accent-pink); color: white; box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3); }
    .btn-primary:hover { opacity: 0.9; transform: scale(1.05); }
    .btn-secondary { background: var(--glass-bg-heavy); color: var(--text-primary); border: 1px solid var(--glass-border-light); }
    .btn-secondary:hover { background: rgba(255,255,255,0.1); }
  `]
})
export class TicTacToeComponent {
  private router = inject(Router);
  board = signal<Player[]>(Array(9).fill(null));
  gameMode = signal<'PvE' | 'PvP'>('PvE');
  
  currentPlayer = signal<'X' | 'O'>('X');
  isAiThinking = signal<boolean>(false);
  
  gameOver = signal<boolean>(false);
  winningLine = signal<number[] | null>(null);
  
  player1Wins = signal(0);
  player2Wins = signal(0); // AI uses this in PvE
  draws = signal(0);

  private readonly WIN_LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];

  setGameMode(mode: 'PvE' | 'PvP') {
    this.gameMode.set(mode);
    this.player1Wins.set(0);
    this.player2Wins.set(0);
    this.draws.set(0);
    this.resetGame();
  }

  statusMessage() {
    if (this.gameOver()) {
      if (this.winningLine()) {
        const winner = this.currentPlayer() === 'X' ? 'O' : 'X'; // turn flipped after move
        if (this.gameMode() === 'PvE') {
          return winner === 'X' ? "You (X) Win! 🎉" : "AI (O) Wins!";
        } else {
          return winner === 'X' ? "Player 1 (X) Wins! 🎉" : "Player 2 (O) Wins! 🎉";
        }
      }
      return "It's a Draw!";
    }
    
    if (this.isAiThinking()) {
      return "AI is thinking...";
    }
    
    if (this.gameMode() === 'PvE') {
      return "Your turn (X)";
    } else {
      return `Player ${this.currentPlayer() === 'X' ? '1 (X)' : '2 (O)'}'s turn`;
    }
  }

  makeMove(index: number) {
    if (this.gameOver() || this.board()[index] || this.isAiThinking()) {
      return;
    }

    const currentMark = this.currentPlayer();
    const newBoard = [...this.board()];
    newBoard[index] = currentMark;
    this.board.set(newBoard);
    
    this.checkGameState(currentMark);

    if (!this.gameOver()) {
      this.currentPlayer.set(currentMark === 'X' ? 'O' : 'X');
      
      if (this.gameMode() === 'PvE' && this.currentPlayer() === 'O') {
        this.isAiThinking.set(true);
        setTimeout(() => this.aiMove(), 600); // Artificial delay for AI
      }
    }
  }

  aiMove() {
    if (this.gameOver()) return;

    const b = this.board();
    let moveIndex = -1;

    // "Beatable" AI Logic: 30% chance to make a completely random move
    const isPlayingDumb = Math.random() < 0.3;

    if (!isPlayingDumb) {
      // 1. Try to win
      moveIndex = this.findWinningMove(b, 'O');
      // 2. Block player from winning
      if (moveIndex === -1) {
        moveIndex = this.findWinningMove(b, 'X');
      }
      // 3. Take center if available
      if (moveIndex === -1 && !b[4]) {
        moveIndex = 4;
      }
    }

    // 4. Random available move
    if (moveIndex === -1) {
      const available = b.map((val, idx) => val === null ? idx : null).filter(val => val !== null) as number[];
      if (available.length > 0) {
        moveIndex = available[Math.floor(Math.random() * available.length)];
      }
    }

    if (moveIndex !== -1) {
      const newBoard = [...this.board()];
      newBoard[moveIndex] = 'O';
      this.board.set(newBoard);
      this.checkGameState('O');
      
      if (!this.gameOver()) {
        this.currentPlayer.set('X');
        this.isAiThinking.set(false);
      }
    }
  }

  private findWinningMove(board: Player[], player: Player): number {
    for (const line of this.WIN_LINES) {
      const [a, b, c] = line;
      if (board[a] === player && board[b] === player && board[c] === null) return c;
      if (board[a] === player && board[c] === player && board[b] === null) return b;
      if (board[b] === player && board[c] === player && board[a] === null) return a;
    }
    return -1;
  }

  private checkGameState(lastPlayer: Player) {
    const b = this.board();
    
    // Check win
    for (const line of this.WIN_LINES) {
      const [a, bIndex, c] = line;
      if (b[a] && b[a] === b[bIndex] && b[a] === b[c]) {
        this.winningLine.set(line);
        this.gameOver.set(true);
        this.isAiThinking.set(false);
        if (lastPlayer === 'X') {
          this.player1Wins.update(w => w + 1);
        } else {
          this.player2Wins.update(w => w + 1);
        }
        return;
      }
    }

    // Check draw
    if (!b.includes(null)) {
      this.gameOver.set(true);
      this.isAiThinking.set(false);
      this.draws.update(d => d + 1);
    }
  }

  resetGame() {
    this.board.set(Array(9).fill(null));
    this.winningLine.set(null);
    this.gameOver.set(false);
    this.currentPlayer.set('X');
    this.isAiThinking.set(false);
  }
  
  exitGame() {
    this.router.navigate(['/games']);
  }
}
