import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="side-menu glass-card">
      <div class="menu-header">
        <h2>🛠️ Dev Tools</h2>
      </div>
      
      <nav class="menu-nav">
        <button 
          class="menu-item glass-medium" 
          [class.active]="activeSection() === 'tools'"
          (click)="setActiveSection('tools')">
          <span class="menu-icon">🔧</span>
          <span class="menu-text">Tools</span>
        </button>
        
        <button 
          class="menu-item glass-medium" 
          [class.active]="activeSection() === 'news'"
          (click)="setActiveSection('news')">
          <span class="menu-icon">📰</span>
          <span class="menu-text">News</span>
        </button>
        
        <button 
          class="menu-item glass-medium" 
          [class.active]="activeSection() === 'resources'"
          (click)="setActiveSection('resources')">
          <span class="menu-icon">📚</span>
          <span class="menu-text">Resources</span>
        </button>
      </nav>
      
      <!-- Quick Tool Links -->
      <div class="quick-tools" *ngIf="showQuickTools()">
        <h3>Quick Tools</h3>
        <div class="quick-tools-grid">
          <a routerLink="/todo" class="quick-tool glass-light">
            <span class="quick-tool-icon">📝</span>
            <span class="quick-tool-text">Todo</span>
          </a>
          <a routerLink="/ip-address" class="quick-tool glass-light">
            <span class="quick-tool-icon">🌐</span>
            <span class="quick-tool-text">IP</span>
          </a>
          <a routerLink="/url-shortener" class="quick-tool glass-light">
            <span class="quick-tool-icon">🔗</span>
            <span class="quick-tool-text">URL</span>
          </a>
          <a routerLink="/timer" class="quick-tool glass-light">
            <span class="quick-tool-icon">⏰</span>
            <span class="quick-tool-text">Timer</span>
          </a>
          <a routerLink="/base64" class="quick-tool glass-light">
            <span class="quick-tool-icon">🔐</span>
            <span class="quick-tool-text">Base64</span>
          </a>
          <a routerLink="/json-formatter" class="quick-tool glass-light">
            <span class="quick-tool-icon">📄</span>
            <span class="quick-tool-text">JSON</span>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .side-menu {
      width: 280px;
      height: fit-content;
      padding: 2rem;
      position: sticky;
      top: 100px;
    }
    
    .menu-header {
      text-align: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--glass-border-light);
    }
    
    .menu-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .menu-nav {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 2rem;
    }
    
    .menu-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.5rem;
      border: none;
      border-radius: 12px;
      background: var(--glass-bg-medium);
      backdrop-filter: var(--glass-blur-heavy);
      -webkit-backdrop-filter: var(--glass-blur-heavy);
      color: var(--text-primary);
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      text-align: left;
    }
    
    .menu-item:hover {
      background: var(--glass-bg-heavy);
      transform: translateX(4px);
    }
    
    .menu-item.active {
      background: linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(236, 72, 153, 0.1));
      border: 1px solid rgba(236, 72, 153, 0.3);
      color: var(--accent-pink);
    }
    
    .menu-icon {
      font-size: 1.2rem;
    }
    
    .menu-text {
      font-weight: 600;
    }
    
    .quick-tools {
      padding-top: 1rem;
      border-top: 1px solid var(--glass-border-light);
    }
    
    .quick-tools h3 {
      margin: 0 0 1rem 0;
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .quick-tools-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5rem;
    }
    
    .quick-tool {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      padding: 0.75rem 0.5rem;
      text-decoration: none;
      color: inherit;
      border-radius: 8px;
      transition: all 0.3s ease;
      font-size: 0.8rem;
    }
    
    .quick-tool:hover {
      background: var(--glass-bg-heavy);
      transform: translateY(-2px);
    }
    
    .quick-tool-icon {
      font-size: 1.2rem;
    }
    
    .quick-tool-text {
      font-weight: 500;
    }
    
    @media (max-width: 1024px) {
      .side-menu {
        width: 100%;
        position: static;
        padding: 1rem;
        margin-bottom: 1rem;
      }
      
      .menu-nav {
        flex-direction: row;
        overflow-x: auto;
        gap: 1rem;
      }
      
      .menu-item {
        white-space: nowrap;
        min-width: 120px;
      }
      
      .quick-tools {
        display: none;
      }
    }
  `]
})
export class SideMenuComponent {
  activeSection = signal<'tools' | 'news' | 'resources'>('tools');
  currentPath = signal<string>('/dashboard');
  
  constructor(private router: Router) {
    // Listen to route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentPath.set(event.url);
        this.updateActiveSection();
      });
    
    // Initialize on component load
    this.updateActiveSection();
  }
  
  private updateActiveSection() {
    const path = this.currentPath();
    if (path === '/') {
      this.activeSection.set('tools');
    } else {
      // For individual tool pages, keep tools section active
      this.activeSection.set('tools');
    }
  }
  
  setActiveSection(section: 'tools' | 'news' | 'resources') {
    this.activeSection.set(section);

    switch(section){
      case 'tools':
        this.router.navigate(['/']);
        break;
        case 'news':
          this.router.navigate(['/news']);
          break;
        default:
          this.router.navigate(['/resources'])
    }
  }
  
  showQuickTools(): boolean {
    const path = this.currentPath();
    return path !== '/';
  }
}
