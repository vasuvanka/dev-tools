import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="toolbar">
      <div class="toolbar-content">
        <div class="toolbar-left">
          <button 
            *ngIf="showBackButton()" 
            (click)="goBack()" 
            class="back-button glass-button glass-button-pink"
            title="Back to Dashboard"
          >
            <span class="back-icon">←</span>
            <span class="back-text">Back</span>
          </button>
          
          <a routerLink="/" class="home-link">
            <div class="home-icon">🛠️</div>
            <span class="home-text">Dev Tools</span>
          </a>
        </div>
        
        
        <div class="toolbar-right">
          <a 
            href="https://github.com/vasuvanka" 
            target="_blank" 
            rel="noopener noreferrer"
            class="github-link"
          >
            <div class="github-icon">👨‍💻</div>
            <span class="github-text">Vasu Vanka</span>
            <svg class="external-icon" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .toolbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }
    
    .toolbar-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .back-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
      font-weight: 600;
      border-radius: 12px;
      transition: all 0.3s ease;
    }
    
    .back-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    
    .back-icon {
      font-size: 1.2rem;
      font-weight: bold;
    }
    
    .back-text {
      font-weight: 600;
    }
    
    .home-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      color: #333;
      font-weight: 600;
      font-size: 1.1rem;
      padding: 0.5rem 1rem;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      transition: all 0.3s ease;
    }
    
    .home-link:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    
    .home-icon {
      font-size: 1.5rem;
    }
    
    .home-text {
      font-weight: 700;
    }
    
    .toolbar-center {
      flex: 1;
      text-align: center;
    }
    
    .toolbar-title {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: #333;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }
    
    .toolbar-right {
      display: flex;
      align-items: center;
    }
    
    .github-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      color: #333;
      font-weight: 500;
      font-size: 0.9rem;
      padding: 0.5rem 1rem;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      transition: all 0.3s ease;
    }
    
    .github-link:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    
    .github-icon {
      font-size: 1.2rem;
    }
    
    .github-text {
      font-weight: 600;
    }
    
    .external-icon {
      opacity: 0.7;
    }
    
    @media (max-width: 768px) {
      .toolbar-content {
        padding: 1rem;
      }
      
      .toolbar-title {
        font-size: 1.2rem;
      }
      
      .home-text, .github-text {
        display: none;
      }
      
      .home-link, .github-link {
        padding: 0.5rem;
      }
    }
  `]
})
export class ToolbarComponent {
  currentPath = signal<string>('/dashboard');
  showBackButton = signal<boolean>(false);
  
  constructor(private router: Router) {
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

}
