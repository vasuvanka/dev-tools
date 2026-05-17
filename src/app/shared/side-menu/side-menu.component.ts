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
      <nav class="menu-nav">
        <button 
          class="menu-item" 
          [class.active]="activeSection() === 'tools'"
          (click)="setActiveSection('tools')">
          <span class="menu-icon">🔧</span>
          <span class="menu-text">Tools</span>
          <div class="active-indicator"></div>
        </button>
        
        <button 
          class="menu-item" 
          [class.active]="activeSection() === 'games'"
          (click)="setActiveSection('games')">
          <span class="menu-icon">🎮</span>
          <span class="menu-text">Games</span>
          <div class="active-indicator"></div>
        </button>
      </nav>
      
      <!-- Quick Tool Links -->
      <div class="quick-tools" *ngIf="showQuickTools()">
        <h3>Quick Access</h3>
        <div class="quick-tools-grid">
          <a routerLink="/todo" class="quick-tool" routerLinkActive="active">
            <span class="quick-tool-icon">📝</span>
            <span class="quick-tool-text">Todo</span>
          </a>
          <a routerLink="/ip-address" class="quick-tool" routerLinkActive="active">
            <span class="quick-tool-icon">🌐</span>
            <span class="quick-tool-text">IP</span>
          </a>
          <a routerLink="/url-shortener" class="quick-tool" routerLinkActive="active">
            <span class="quick-tool-icon">🔗</span>
            <span class="quick-tool-text">URL</span>
          </a>
          <a routerLink="/timer" class="quick-tool" routerLinkActive="active">
            <span class="quick-tool-icon">⏰</span>
            <span class="quick-tool-text">Timer</span>
          </a>
          <a routerLink="/base64" class="quick-tool" routerLinkActive="active">
            <span class="quick-tool-icon">🔐</span>
            <span class="quick-tool-text">Base64</span>
          </a>
          <a routerLink="/json-formatter" class="quick-tool" routerLinkActive="active">
            <span class="quick-tool-icon">📄</span>
            <span class="quick-tool-text">JSON</span>
          </a>
          <a routerLink="/jwt-debugger" class="quick-tool" routerLinkActive="active">
            <span class="quick-tool-icon">🔑</span>
            <span class="quick-tool-text">JWT</span>
          </a>
          <a routerLink="/hash-generator" class="quick-tool" routerLinkActive="active">
            <span class="quick-tool-icon">🧬</span>
            <span class="quick-tool-text">Hash</span>
          </a>
          <a routerLink="/uuid-generator" class="quick-tool" routerLinkActive="active">
            <span class="quick-tool-icon">🆔</span>
            <span class="quick-tool-text">UUID</span>
          </a>
          <a routerLink="/timestamp-converter" class="quick-tool" routerLinkActive="active">
            <span class="quick-tool-icon">🕒</span>
            <span class="quick-tool-text">Time</span>
          </a>
          <a routerLink="/url-encoder" class="quick-tool" routerLinkActive="active">
            <span class="quick-tool-icon">⛓️</span>
            <span class="quick-tool-text">Encode</span>
          </a>
          <a routerLink="/css-generator" class="quick-tool" routerLinkActive="active">
            <span class="quick-tool-icon">🎨</span>
            <span class="quick-tool-text">CSS</span>
          </a>
          <a routerLink="/dummy-data" class="quick-tool" routerLinkActive="active">
            <span class="quick-tool-icon">📝</span>
            <span class="quick-tool-text">Dummy</span>
          </a>
          <a routerLink="/markdown-previewer" class="quick-tool" routerLinkActive="active">
            <span class="quick-tool-icon">👀</span>
            <span class="quick-tool-text">MD</span>
          </a>
          <a routerLink="/photo-editor" class="quick-tool" routerLinkActive="active">
            <span class="quick-tool-icon">🖼️</span>
            <span class="quick-tool-text">Photo</span>
          </a>
          <a routerLink="/audio-converter" class="quick-tool" routerLinkActive="active">
            <span class="quick-tool-icon">🎵</span>
            <span class="quick-tool-text">Audio</span>
          </a>
          <a routerLink="/pdf-tools" class="quick-tool" routerLinkActive="active">
            <span class="quick-tool-icon">📑</span>
            <span class="quick-tool-text">PDF</span>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .side-menu {
      width: 280px;
      height: fit-content;
      padding: 1.5rem;
      position: sticky;
      top: 100px;
      border: 1px solid var(--glass-border-light);
    }
    
    .menu-nav {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 2rem;
    }
    
    .menu-item {
      position: relative;
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.5rem;
      border: 1px solid transparent;
      border-radius: 12px;
      background: transparent;
      color: var(--text-secondary);
      font-size: 1.1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      text-align: left;
      overflow: hidden;
      font-family: inherit;
    }
    
    .menu-item:hover {
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-primary);
    }
    
    .menu-item.active {
      background: linear-gradient(90deg, rgba(34, 211, 238, 0.1) 0%, transparent 100%);
      color: var(--accent-cyan);
      border-color: rgba(34, 211, 238, 0.2);
    }
    
    .active-indicator {
      position: absolute;
      left: 0; top: 0; bottom: 0; width: 3px;
      background: var(--accent-cyan);
      opacity: 0;
      transition: opacity 0.3s;
      box-shadow: 0 0 10px var(--accent-cyan);
    }
    
    .menu-item.active .active-indicator {
      opacity: 1;
    }
    
    .menu-icon {
      font-size: 1.4rem;
      filter: grayscale(1);
      transition: filter 0.3s;
    }
    
    .menu-item:hover .menu-icon, .menu-item.active .menu-icon {
      filter: grayscale(0);
    }
    
    .menu-text {
      font-weight: 600;
    }
    
    .quick-tools {
      padding-top: 1.5rem;
      border-top: 1px solid var(--glass-border-light);
    }
    
    .quick-tools h3 {
      margin: 0 0 1rem 0.5rem;
      font-size: 0.9rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--text-secondary);
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
      gap: 0.5rem;
      padding: 0.75rem 0.5rem;
      text-decoration: none;
      color: var(--text-secondary);
      border-radius: 12px;
      transition: all 0.3s ease;
      font-size: 0.85rem;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid transparent;
    }
    
    .quick-tool:hover {
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-primary);
      transform: translateY(-2px);
    }
    
    .quick-tool.active {
      background: rgba(236, 72, 153, 0.1);
      color: var(--accent-pink);
      border-color: rgba(236, 72, 153, 0.2);
    }
    
    .quick-tool-icon {
      font-size: 1.4rem;
      filter: grayscale(1);
      transition: filter 0.3s;
    }
    
    .quick-tool:hover .quick-tool-icon, .quick-tool.active .quick-tool-icon {
      filter: grayscale(0);
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
        display: flex;
        flex-direction: column;
      }
      
      .menu-nav {
        flex-direction: row;
        overflow-x: auto;
        gap: 1rem;
        margin-bottom: 0;
      }
      
      .menu-item {
        white-space: nowrap;
        min-width: 140px;
        justify-content: center;
      }
      
      .active-indicator {
        left: 0; right: 0; bottom: 0; top: auto; height: 3px; width: auto;
      }
      
      .quick-tools {
        display: none;
      }
    }
  `]
})
export class SideMenuComponent {
  activeSection = signal<'tools' | 'news' | 'resources' | 'games'>('tools');
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
    } else if (path.startsWith('/games')) {
      this.activeSection.set('games');
    } else {
      // For individual tool pages, keep tools section active
      this.activeSection.set('tools');
    }
  }

  setActiveSection(section: 'tools' | 'news' | 'resources' | 'games') {
    this.activeSection.set(section);

    switch (section) {
      case 'tools':
        this.router.navigate(['/']);
        break;
      case 'news':
        this.router.navigate(['/news']);
        break;
      case 'games':
        this.router.navigate(['/games']);
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
