import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard">
        <!-- Tools Section -->
        <div class="content-section" *ngIf="activeSection() === 'tools'">
          <div class="tools-grid">
            <div class="tool-card glass-medium" routerLink="/todo">
              <div class="tool-icon">📝</div>
              <h3>Todo List</h3>
              <p>Track tasks with progress</p>
            </div>
            
            <div class="tool-card glass-medium" routerLink="/ip-address">
              <div class="tool-icon">🌐</div>
              <h3>IP Address</h3>
              <p>Check your network IP</p>
            </div>
            
            <div class="tool-card glass-medium" routerLink="/url-shortener">
              <div class="tool-icon">🔗</div>
              <h3>URL Shortener</h3>
              <p>Create short links</p>
            </div>
            
            <div class="tool-card glass-medium" routerLink="/timer">
              <div class="tool-icon">⏰</div>
              <h3>Timer</h3>
              <p>Countdown with beep</p>
            </div>
            
            <div class="tool-card glass-medium" routerLink="/base64">
              <div class="tool-icon">🔐</div>
              <h3>Base64</h3>
              <p>Encode & decode</p>
            </div>
            
            <div class="tool-card glass-medium" routerLink="/json-formatter">
              <div class="tool-icon">📄</div>
              <h3>JSON Formatter</h3>
              <p>Format & validate JSON</p>
            </div>
            
            <div class="tool-card glass-medium" routerLink="/qr-generator">
              <div class="tool-icon">📱</div>
              <h3>QR Generator</h3>
              <p>Generate QR codes</p>
            </div>
            
            <div class="tool-card glass-medium" routerLink="/color-picker">
              <div class="tool-icon">🎨</div>
              <h3>Color Picker</h3>
              <p>Pick & convert colors</p>
            </div>
            
            <div class="tool-card glass-medium" routerLink="/text-tools">
              <div class="tool-icon">📝</div>
              <h3>Text Tools</h3>
              <p>Text manipulation & analysis</p>
            </div>
          </div>
        </div>
        
        <!-- News Section -->
        <div class="content-section" *ngIf="activeSection() === 'news'">
          <div class="section-header glass-section">
            <h1>📰 Latest Developer News</h1>
            <p>Stay updated with the latest in tech, crypto, and software releases</p>
          </div>
          
          <div class="news-grid">
            <div class="news-card glass-medium">
              <div class="news-card-header">
                <h3>🚀 Tech News</h3>
                <span class="news-source">Hacker News</span>
              </div>
              <div class="news-iframe-container">
                <iframe 
                  src="https://hn.algolia.com/?dateRange=pastWeek&page=0&prefix=false&query=&sort=byPopularity&type=story"
                  class="news-iframe"
                  title="Hacker News"
                  loading="lazy">
                </iframe>
              </div>
            </div>
            
            <div class="news-card glass-medium">
              <div class="news-card-header">
                <h3>💰 Crypto News</h3>
                <span class="news-source">CryptoPanic</span>
              </div>
              <div class="news-iframe-container">
                <iframe 
                  src="https://cryptopanic.com/news/"
                  class="news-iframe"
                  title="CryptoPanic Crypto News"
                  loading="lazy">
                </iframe>
              </div>
            </div>
            
            <div class="news-card glass-medium">
              <div class="news-card-header">
                <h3>🔧 Software Releases</h3>
                <span class="news-source">Dev.to</span>
              </div>
              <div class="news-iframe-container">
                <iframe 
                  src="https://dev.to/"
                  class="news-iframe"
                  title="Dev.to Developer Community"
                  loading="lazy">
                </iframe>
              </div>
            </div>
            
            <div class="news-card glass-medium">
              <div class="news-card-header">
                <h3>📱 Tech News</h3>
                <span class="news-source">TechCrunch</span>
              </div>
              <div class="news-iframe-container">
                <iframe 
                  src="https://techcrunch.com/"
                  class="news-iframe"
                  title="TechCrunch Tech News"
                  loading="lazy">
                </iframe>
              </div>
            </div>
          </div>
          
          <div class="news-actions glass-section">
            <button class="refresh-news glass-button glass-button-pink" (click)="refreshNews()">
              🔄 Refresh News
            </button>
            <button class="open-all-news glass-button glass-button-blue" (click)="openAllNews()">
              🌐 Open All Sources
            </button>
          </div>
        </div>
        
        <!-- Resources Section -->
        <div class="content-section" *ngIf="activeSection() === 'resources'">
          <div class="section-header glass-section">
            <h1>📚 Developer Resources</h1>
            <p>Quick access to popular developer resources and communities</p>
          </div>
          
          <div class="resources-grid">
            <a href="https://github.com/trending" target="_blank" rel="noopener noreferrer" class="resource-card glass-medium">
              <div class="resource-icon">📈</div>
              <h3>GitHub Trending</h3>
              <p>Discover trending repositories</p>
            </a>
            
            <a href="https://www.producthunt.com/" target="_blank" rel="noopener noreferrer" class="resource-card glass-medium">
              <div class="resource-icon">🚀</div>
              <h3>Product Hunt</h3>
              <p>New products and startups</p>
            </a>
            
            <a href="https://www.reddit.com/r/programming/" target="_blank" rel="noopener noreferrer" class="resource-card glass-medium">
              <div class="resource-icon">💬</div>
              <h3>Reddit Programming</h3>
              <p>Programming discussions</p>
            </a>
            
            <a href="https://stackoverflow.com/questions/tagged/javascript" target="_blank" rel="noopener noreferrer" class="resource-card glass-medium">
              <div class="resource-icon">❓</div>
              <h3>Stack Overflow</h3>
              <p>Programming Q&A</p>
            </a>
            
            <a href="https://dev.to/" target="_blank" rel="noopener noreferrer" class="resource-card glass-medium">
              <div class="resource-icon">👨‍💻</div>
              <h3>Dev.to</h3>
              <p>Developer community</p>
            </a>
            
            <a href="https://www.freecodecamp.org/" target="_blank" rel="noopener noreferrer" class="resource-card glass-medium">
              <div class="resource-icon">🎓</div>
              <h3>FreeCodeCamp</h3>
              <p>Learn to code for free</p>
            </a>
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
    
    /* Tools Grid */
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
    
    /* News Grid */
    .news-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
    }
    
    .news-card {
      padding: 1.5rem;
      border-radius: 16px;
      transition: all 0.3s ease;
    }
    
    .news-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }
    
    .news-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--glass-border-light);
    }
    
    .news-card-header h3 {
      margin: 0;
      font-size: 1.2rem;
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .news-source {
      font-size: 0.8rem;
      color: var(--text-secondary);
      background: var(--glass-bg-light);
      padding: 0.25rem 0.5rem;
      border-radius: 8px;
    }
    
    .news-iframe-container {
      position: relative;
      width: 100%;
      height: 300px;
      border-radius: 12px;
      overflow: hidden;
      background: var(--glass-bg-light);
    }
    
    .news-iframe {
      width: 100%;
      height: 100%;
      border: none;
      border-radius: 12px;
      background: white;
    }
    
    .news-actions {
      display: flex;
      justify-content: center;
      gap: 1rem;
      padding: 1.5rem;
    }
    
    .refresh-news,
    .open-all-news {
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 12px;
      transition: all 0.3s ease;
    }
    
    .refresh-news:hover,
    .open-all-news:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    
    /* Resources Grid */
    .resources-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
    }
    
    .resource-card {
      padding: 2rem;
      text-align: center;
      text-decoration: none;
      color: inherit;
      border-radius: 16px;
      transition: all 0.3s ease;
    }
    
    .resource-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    }
    
    .resource-icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
    }
    
    .resource-card h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.3rem;
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .resource-card p {
      margin: 0;
      color: var(--text-secondary);
      font-size: 0.9rem;
    }
    
    /* Responsive Design */
    
    @media (max-width: 768px) {
      .dashboard {
        padding: 1rem;
      }
      
      .section-header h1 {
        font-size: 2rem;
      }
      
      .tools-grid,
      .resources-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      
      .news-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      
      .news-iframe-container {
        height: 250px;
      }
      
      .news-actions {
        flex-direction: column;
        align-items: center;
      }
      
      .refresh-news,
      .open-all-news {
        width: 100%;
        max-width: 300px;
      }
    }
  `]
})
export class DashboardComponent {
  activeSection = signal<'tools' | 'news' | 'resources'>('tools');
  
  setActiveSection(section: 'tools' | 'news' | 'resources') {
    this.activeSection.set(section);
  }
  
  refreshNews() {
    // Refresh all iframes by reloading the page
    window.location.reload();
  }
  
  openAllNews() {
    // Open all news sources in new tabs
    const newsSources = [
      'https://hn.algolia.com/?dateRange=pastWeek&page=0&prefix=false&query=&sort=byPopularity&type=story',
      'https://cryptopanic.com/news/',
      'https://dev.to/',
      'https://techcrunch.com/'
    ];
    
    newsSources.forEach(source => {
      window.open(source, '_blank', 'noopener,noreferrer');
    });
  }
}
