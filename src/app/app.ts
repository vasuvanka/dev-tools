import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToolbarComponent } from './shared/toolbar/toolbar.component';
import { SideMenuComponent } from './shared/side-menu/side-menu.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToolbarComponent, SideMenuComponent],
  template: `
    <app-toolbar></app-toolbar>
    <div class="app-content">
      <div class="app-layout">
        <app-side-menu></app-side-menu>
        <div class="main-content">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
  styles: [`
    .app-content {
      margin-top: 80px;
      min-height: calc(100vh - 80px);
    }
    
    .app-layout {
      display: flex;
      gap: 2rem;
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }
    
    .main-content {
      flex: 1;
      min-width: 0;
    }
    
    @media (max-width: 1024px) {
      .app-layout {
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
      }
    }
  `]
})
export class App {}
