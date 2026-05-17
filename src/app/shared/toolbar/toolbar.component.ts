import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="toolbar glass-heavy">
      <div class="toolbar-content">
        <div class="toolbar-left">
          <button 
            *ngIf="showBackButton()" 
            (click)="goBack()" 
            class="glass-button glass-button-pink back-btn"
            title="Back to Dashboard"
          >
            <span class="btn-icon">←</span>
            <span class="btn-text">Back</span>
          </button>
          
          <a routerLink="/" class="logo-link">
            <div class="logo-icon glow-pulse">⚡</div>
            <span class="logo-text">Vasu Vanka <span class="text-cyan">Dev Tools</span></span>
          </a>
        </div>
        
        <div class="toolbar-right">
          <button 
            (click)="toggleTheme()" 
            class="glass-button glass-button-primary theme-btn"
            [title]="themeService.currentTheme() === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'"
          >
            <span class="btn-icon">{{ themeService.currentTheme() === 'dark' ? '☀️' : '🌙' }}</span>
          </button>
          
          <a 
            href="https://github.com/vasuvanka" 
            target="_blank" 
            rel="noopener noreferrer"
            class="glass-button github-btn"
          >
            <span class="btn-icon">👨‍💻</span>
            <span class="btn-text">GitHub</span>
          </a>
        </div>
      </div>
      <!-- Glowing bottom edge line -->
      <div class="toolbar-glow-line"></div>
    </div>
  `,
  styles: [`
    .toolbar {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 1000;
      border-bottom: 1px solid var(--glass-border-light);
    }
    
    .toolbar-glow-line {
      position: absolute;
      bottom: -1px; left: 0; right: 0; height: 1px;
      background: var(--gradient-aurora);
      opacity: 0.5;
    }
    
    .toolbar-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 2rem;
      max-width: 1400px;
      margin: 0 auto;
      height: 70px;
    }
    
    .toolbar-left, .toolbar-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .logo-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      color: var(--text-primary);
      padding: 0.5rem;
      border-radius: 12px;
      transition: all 0.3s ease;
    }
    
    .logo-link:hover {
      transform: translateY(-2px);
      text-shadow: 0 0 15px rgba(255,255,255,0.2);
    }
    
    .logo-icon {
      font-size: 1.8rem;
      filter: drop-shadow(0 0 10px rgba(34, 211, 238, 0.5));
    }
    
    .logo-text {
      font-weight: 800;
      font-size: 1.25rem;
      letter-spacing: -0.5px;
    }
    
    .btn-icon {
      font-size: 1.1rem;
    }
    
    .btn-text {
      font-weight: 600;
    }
    
    .back-btn, .github-btn {
      padding: 0.5rem 1.25rem;
    }
    
    .theme-btn {
      padding: 0.5rem;
      border-radius: 50%;
      width: 40px;
      height: 40px;
    }
    
    @keyframes pulse-soft {
      0%, 100% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(34, 211, 238, 0.5)); }
      50% { transform: scale(1.1); filter: drop-shadow(0 0 20px rgba(34, 211, 238, 0.8)); }
    }
    
    .glow-pulse {
      animation: pulse-soft 3s infinite ease-in-out;
    }
    
    @media (max-width: 768px) {
      .toolbar-content {
        padding: 0.5rem 1rem;
      }
      .logo-text span {
        display: none; /* Hide 'Dev Tools' on small screens */
      }
      .btn-text {
        display: none;
      }
      .back-btn, .github-btn {
        padding: 0.5rem;
        border-radius: 50%;
        width: 40px;
        height: 40px;
      }
    }
  `]
})
export class ToolbarComponent {
  currentPath = signal<string>('/dashboard');
  showBackButton = signal<boolean>(false);
  
  constructor(
    private router: Router,
    public themeService: ThemeService
  ) {
    // Listen to route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentPath.set(event.url);
        this.updateBackButtonVisibility();
      });
    
    // Initialize on component load
    this.updateBackButtonVisibility();
  }
  
  private updateBackButtonVisibility() {
    const path = this.currentPath();
    // Show back button for all routes except dashboard
    this.showBackButton.set(path !== '/dashboard' && path !== '/');
  }
  
  goBack() {
    this.router.navigate(['/dashboard']);
  }
  
  toggleTheme() {
    this.themeService.toggleTheme();
  }

}
