import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { quotes } from '../quotes';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard">
               
      <div class="section-header"> 
        <div class="quote-container">
          <span class="quote-mark open">"</span>
          <p class="quote-text">{{currentQuote()}}</p>
          <span class="quote-mark close">"</span>
        </div>
      </div>
        
      <!-- Tools Section -->
      <div class="content-section fade-in-up" *ngIf="activeSection() === 'tools'">
        <div class="tools-grid">
          <div class="tool-card group" routerLink="/todo">
            <div class="tool-glow glow-pink"></div>
            <div class="tool-icon-wrapper">
              <span class="tool-icon">📝</span>
            </div>
            <h3>Todo List</h3>
            <p>Track tasks with progress</p>
            <div class="card-border"></div>
          </div>
          
          <div class="tool-card group" routerLink="/ip-address">
            <div class="tool-glow glow-cyan"></div>
            <div class="tool-icon-wrapper">
              <span class="tool-icon">🌐</span>
            </div>
            <h3>IP Address</h3>
            <p>Check your network IP</p>
            <div class="card-border"></div>
          </div>
          
          <div class="tool-card group" routerLink="/url-shortener">
            <div class="tool-glow glow-blue"></div>
            <div class="tool-icon-wrapper">
              <span class="tool-icon">🔗</span>
            </div>
            <h3>URL Shortener</h3>
            <p>Create short links</p>
            <div class="card-border"></div>
          </div>
          
          <div class="tool-card group" routerLink="/timer">
            <div class="tool-glow glow-orange"></div>
            <div class="tool-icon-wrapper">
              <span class="tool-icon">⏰</span>
            </div>
            <h3>Timer</h3>
            <p>Countdown with beep</p>
            <div class="card-border"></div>
          </div>
          
          <div class="tool-card group" routerLink="/base64">
            <div class="tool-glow glow-purple"></div>
            <div class="tool-icon-wrapper">
              <span class="tool-icon">🔐</span>
            </div>
            <h3>Base64</h3>
            <p>Encode & decode</p>
            <div class="card-border"></div>
          </div>
          
          <div class="tool-card group" routerLink="/json-formatter">
            <div class="tool-glow glow-green"></div>
            <div class="tool-icon-wrapper">
              <span class="tool-icon">📄</span>
            </div>
            <h3>JSON Formatter</h3>
            <p>Format & validate JSON</p>
            <div class="card-border"></div>
          </div>
          
          <div class="tool-card group" routerLink="/qr-generator">
            <div class="tool-glow glow-pink"></div>
            <div class="tool-icon-wrapper">
              <span class="tool-icon">📱</span>
            </div>
            <h3>QR Generator</h3>
            <p>Generate QR codes</p>
            <div class="card-border"></div>
          </div>
          
          <div class="tool-card group" routerLink="/color-picker">
            <div class="tool-glow glow-cyan"></div>
            <div class="tool-icon-wrapper">
              <span class="tool-icon">🎨</span>
            </div>
            <h3>Color Picker</h3>
            <p>Pick & convert colors</p>
            <div class="card-border"></div>
          </div>
          
          <div class="tool-card group" routerLink="/text-tools">
            <div class="tool-glow glow-orange"></div>
            <div class="tool-icon-wrapper">
              <span class="tool-icon">📝</span>
            </div>
            <h3>Text Tools</h3>
            <p>Text manipulation</p>
            <div class="card-border"></div>
          </div>

          <div class="tool-card group" routerLink="/jwt-debugger">
            <div class="tool-glow glow-pink"></div>
            <div class="tool-icon-wrapper">
              <span class="tool-icon">🔑</span>
            </div>
            <h3>JWT Debugger</h3>
            <p>Decode JSON Web Tokens</p>
            <div class="card-border"></div>
          </div>

          <div class="tool-card group" routerLink="/hash-generator">
            <div class="tool-glow glow-blue"></div>
            <div class="tool-icon-wrapper">
              <span class="tool-icon">🧬</span>
            </div>
            <h3>Hash Generator</h3>
            <p>MD5, SHA1, SHA256 hashes</p>
            <div class="card-border"></div>
          </div>

          <div class="tool-card group" routerLink="/uuid-generator">
            <div class="tool-glow glow-cyan"></div>
            <div class="tool-icon-wrapper">
              <span class="tool-icon">🆔</span>
            </div>
            <h3>UUID & Passwords</h3>
            <p>Secure random generators</p>
            <div class="card-border"></div>
          </div>
          
          <div class="tool-card group" routerLink="/photo-editor">
            <div class="tool-glow glow-blue"></div>
            <div class="tool-icon-wrapper">
              <span class="tool-icon">🖼️</span>
            </div>
            <h3>Photo Editor</h3>
            <p>Crop & filter</p>
            <div class="card-border"></div>
          </div>

          <div class="tool-card group" routerLink="/audio-converter">
            <div class="tool-glow glow-purple"></div>
            <div class="tool-icon-wrapper">
              <span class="tool-icon">🎵</span>
            </div>
            <h3>Audio Converter</h3>
            <p>Convert formats</p>
            <div class="card-border"></div>
          </div>

          <div class="tool-card group" routerLink="/pdf-tools">
            <div class="tool-glow glow-green"></div>
            <div class="tool-icon-wrapper">
              <span class="tool-icon">📑</span>
            </div>
            <h3>PDF Tools</h3>
            <p>Preview & edit PDFs</p>
            <div class="card-border"></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      min-height: calc(100vh - 80px);
      padding-bottom: 4rem;
    }
    
    .section-header {
      display: flex;
      justify-content: center;
      margin-bottom: 4rem;
      padding: 0 2rem;
    }
    
    .quote-container {
      position: relative;
      max-width: 800px;
      text-align: center;
      padding: 2rem;
      background: linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%);
      border-radius: 24px;
      border: 1px solid rgba(255,255,255,0.05);
    }
    
    .quote-mark {
      position: absolute;
      font-size: 6rem;
      color: var(--accent-cyan);
      opacity: 0.15;
      font-family: serif;
      line-height: 1;
    }
    
    .quote-mark.open { top: -10px; left: 10px; }
    .quote-mark.close { bottom: -40px; right: 10px; transform: rotate(180deg); }
    
    .quote-text {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 300;
      color: var(--text-primary);
      line-height: 1.6;
      letter-spacing: 0.5px;
    }
    
    /* Tools Grid */
    .tools-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }
    
    .tool-card {
      position: relative;
      padding: 2rem;
      background: rgba(24, 24, 27, 0.4);
      border-radius: 20px;
      cursor: pointer;
      text-decoration: none;
      color: inherit;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      overflow: hidden;
    }
    
    .card-border {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      border-radius: 20px;
      border: 1px solid rgba(255,255,255,0.05);
      transition: border-color 0.4s;
      pointer-events: none;
    }
    
    .tool-glow {
      position: absolute;
      width: 150px;
      height: 150px;
      top: -50px;
      right: -50px;
      border-radius: 50%;
      filter: blur(40px);
      opacity: 0;
      transition: opacity 0.5s ease;
      pointer-events: none;
      z-index: 0;
    }
    
    .glow-pink { background: rgba(236, 72, 153, 0.4); }
    .glow-cyan { background: rgba(34, 211, 238, 0.4); }
    .glow-blue { background: rgba(96, 165, 250, 0.4); }
    .glow-orange { background: rgba(251, 146, 60, 0.4); }
    .glow-purple { background: rgba(168, 85, 247, 0.4); }
    .glow-green { background: rgba(52, 211, 153, 0.4); }
    
    .tool-card:hover {
      transform: translateY(-5px) scale(1.02);
      background: rgba(39, 39, 42, 0.6);
      box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5);
    }
    
    .tool-card:hover .card-border {
      border-color: rgba(255,255,255,0.15);
    }
    
    .tool-card:hover .tool-glow {
      opacity: 1;
    }
    
    .tool-icon-wrapper {
      width: 60px;
      height: 60px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.05);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
      z-index: 1;
      transition: all 0.3s;
    }
    
    .tool-card:hover .tool-icon-wrapper {
      background: rgba(255, 255, 255, 0.1);
      transform: scale(1.1);
    }
    
    .tool-icon {
      font-size: 2rem;
      filter: grayscale(0.5);
      transition: filter 0.3s;
    }
    
    .tool-card:hover .tool-icon {
      filter: grayscale(0) drop-shadow(0 0 10px rgba(255,255,255,0.5));
    }
    
    .tool-card h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
      z-index: 1;
    }
    
    .tool-card p {
      margin: 0;
      color: var(--text-secondary);
      font-size: 0.95rem;
      z-index: 1;
    }
    
    @media (max-width: 768px) {
      .tools-grid {
        grid-template-columns: 1fr;
      }
      
      .quote-container {
        padding: 1.5rem;
      }
      
      .quote-text {
        font-size: 1.1rem;
      }
    }
  `]
})
export class DashboardComponent {
  activeSection = signal<'tools' | 'news' | 'resources'>('tools');
  currentQuote = signal<string>('');

  setActiveSection(section: 'tools' | 'news' | 'resources') {
    this.activeSection.set(section);
  }

  constructor() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    this.currentQuote.set(quotes[randomIndex]);
  }
}
