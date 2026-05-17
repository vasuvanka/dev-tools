import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-games-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard">
      <div class="section-header glass-section"> 
        <h1>🎮 Arcade</h1>
        <p>Take a quick break and relieve stress with these short games.</p>
      </div>

      <div class="content-section">
        <div class="tools-grid">
          
          <div class="tool-card glass-medium" routerLink="/games/snake">
            <div class="tool-icon">🐍🥚</div>
            <h3>Snake n Eggs</h3>
            <p>Classic snake game but with eggs!</p>
          </div>

          <div class="tool-card glass-medium" routerLink="/games/bounce">
            <div class="tool-icon">🔴</div>
            <h3>Bounce</h3>
            <p>25 Levels of Platforming!</p>
          </div>

          <div class="tool-card glass-medium" routerLink="/games/tic-tac-toe">
            <div class="tool-icon">❌⭕</div>
            <h3>Tic Tac Toe</h3>
            <p>Classic game vs AI.</p>
          </div>

          <div class="tool-card glass-medium" routerLink="/games/angry-birds">
            <div class="tool-icon">🐦</div>
            <h3>Angry Birds</h3>
            <p>Knock down the pigs! (4 levels)</p>
          </div>

          <div class="tool-card glass-medium" routerLink="/games/tetris">
            <div class="tool-icon">🧱</div>
            <h3>Block Puzzle</h3>
            <p>Clear the lines!</p>
          </div>

          <div class="tool-card glass-medium" routerLink="/games/space-blaster">
            <div class="tool-icon">🚀</div>
            <h3>Space Blaster</h3>
            <p>Shoot the asteroids!</p>
          </div>

          <div class="tool-card glass-medium" routerLink="/games/mario-runner">
            <div class="tool-icon">🏃‍♂️🍄</div>
            <h3>Mario Runner</h3>
            <p>Endless 8-bit runner!</p>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      min-height: calc(100vh - 80px);
    }
    .content-section {
      animation: fadeIn 0.3s ease-in-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .section-header {
      text-align: center;
      margin-bottom: 3rem;
      padding: 2rem;
    }
    .section-header h1 {
      margin: 0 0 0.5rem 0;
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    .section-header p {
      margin: 0;
      font-size: 1.1rem;
      color: var(--text-secondary);
    }
    .tools-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
    }
    .tool-card {
      padding: 2rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      color: inherit;
      border-radius: 16px;
    }
    .tool-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    }
    .tool-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
    }
    .tool-card h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-primary);
    }
    .tool-card p {
      margin: 0;
      color: var(--text-secondary);
      font-size: 0.9rem;
    }
  `]
})
export class GamesDashboardComponent {}
