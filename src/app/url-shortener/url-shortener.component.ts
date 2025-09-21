import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ShortUrl {
  original: string;
  short: string;
  createdAt: Date;
}

@Component({
  selector: 'app-url-shortener',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="url-container">
      <div class="url-header">
        <h1>🔗 URL Shortener</h1>
        <p>Create short, shareable links</p>
      </div>
      
      <div class="url-form">
        <div class="input-group">
          <input 
            type="url" 
            [(ngModel)]="urlInput" 
            placeholder="Enter your long URL here..."
            class="url-input"
            (keyup.enter)="shortenUrl()"
          >
          <button 
            (click)="shortenUrl()" 
            class="shorten-button"
            [disabled]="!isValidUrl(urlInput) || loading()"
          >
            {{ loading() ? 'Shortening...' : 'Shorten' }}
          </button>
        </div>
        
        <div *ngIf="errorMessage()" class="error-message">
          {{ errorMessage() }}
        </div>
      </div>
      
      <div *ngIf="shortenedUrl()" class="result-section">
        <h3>Shortened URL:</h3>
        <div class="url-result">
          <input 
            type="text" 
            [value]="shortenedUrl()" 
            readonly 
            class="result-input"
          >
          <button (click)="copyUrl()" class="copy-button">
            📋 Copy
          </button>
        </div>
        
        <div class="url-stats">
          <div class="stat">
            <span class="stat-label">Original Length:</span>
            <span class="stat-value">{{ originalUrl().length }} characters</span>
          </div>
          <div class="stat">
            <span class="stat-label">Shortened Length:</span>
            <span class="stat-value">{{ shortenedUrl()?.length || 0 }} characters</span>
          </div>
          <div class="stat">
            <span class="stat-label">Saved:</span>
            <span class="stat-value">{{ getSavings() }}%</span>
          </div>
        </div>
      </div>
      
      <div class="url-history" *ngIf="urlHistory().length > 0">
        <h3>Recent URLs</h3>
        <div class="history-list">
          <div 
            *ngFor="let url of urlHistory(); trackBy: trackByFn" 
            class="history-item"
          >
            <div class="history-content">
              <div class="original-url">{{ url.original }}</div>
              <div class="short-url">{{ url.short }}</div>
              <div class="created-at">{{ formatDate(url.createdAt) }}</div>
            </div>
            <div class="history-actions">
              <button (click)="copyUrlFromHistory(url.short)" class="action-button">
                📋
              </button>
              <button (click)="deleteFromHistory(url)" class="action-button delete">
                🗑️
              </button>
            </div>
          </div>
        </div>
        
        <button (click)="clearHistory()" class="clear-button">
          Clear History
        </button>
      </div>
    </div>
  `,
  styles: [`
    .url-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    
    .url-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    
    .url-header h1 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 2rem;
    }
    
    .url-header p {
      margin: 0;
      color: #666;
    }
    
    .url-form {
      margin-bottom: 2rem;
    }
    
    .input-group {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    
    .url-input {
      flex: 1;
      padding: 1rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
      outline: none;
      transition: border-color 0.3s ease;
    }
    
    .url-input:focus {
      border-color: #667eea;
    }
    
    .shorten-button {
      padding: 1rem 2rem;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.3s ease;
    }
    
    .shorten-button:hover:not(:disabled) {
      background: #5a6fd8;
    }
    
    .shorten-button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    
    .error-message {
      color: #ff4757;
      background: #ffe6e6;
      padding: 0.75rem;
      border-radius: 8px;
      border: 1px solid #ffcccc;
    }
    
    .result-section {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .result-section h3 {
      margin: 0 0 1rem 0;
      color: #333;
    }
    
    .url-result {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    
    .result-input {
      flex: 1;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: white;
      font-family: 'Courier New', monospace;
    }
    
    .copy-button {
      padding: 0.75rem 1rem;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    }
    
    .copy-button:hover {
      background: #45a049;
    }
    
    .url-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
    }
    
    .stat {
      text-align: center;
      padding: 0.5rem;
      background: white;
      border-radius: 8px;
    }
    
    .stat-label {
      display: block;
      font-size: 0.9rem;
      color: #666;
      margin-bottom: 0.25rem;
    }
    
    .stat-value {
      font-weight: 600;
      color: #333;
    }
    
    .url-history h3 {
      margin: 0 0 1rem 0;
      color: #333;
    }
    
    .history-list {
      margin-bottom: 1rem;
    }
    
    .history-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      margin-bottom: 0.5rem;
      background: white;
    }
    
    .history-content {
      flex: 1;
    }
    
    .original-url {
      font-weight: 600;
      color: #333;
      margin-bottom: 0.25rem;
      word-break: break-all;
    }
    
    .short-url {
      font-family: 'Courier New', monospace;
      color: #667eea;
      margin-bottom: 0.25rem;
    }
    
    .created-at {
      font-size: 0.8rem;
      color: #666;
    }
    
    .history-actions {
      display: flex;
      gap: 0.5rem;
    }
    
    .action-button {
      padding: 0.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      background: #f8f9fa;
      transition: background 0.3s ease;
    }
    
    .action-button:hover {
      background: #e9ecef;
    }
    
    .action-button.delete:hover {
      background: #ff4757;
      color: white;
    }
    
    .clear-button {
      padding: 0.75rem 1rem;
      background: #ff4757;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    }
    
    .clear-button:hover {
      background: #ff3742;
    }
    
    @media (max-width: 768px) {
      .url-container {
        padding: 1rem;
      }
      
      .input-group {
        flex-direction: column;
      }
      
      .url-result {
        flex-direction: column;
      }
      
      .history-item {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }
      
      .history-actions {
        justify-content: center;
      }
    }
  `]
})
export class UrlShortenerComponent {
  urlInput = '';
  shortenedUrl = signal<string>('');
  originalUrl = signal<string>('');
  errorMessage = signal<string>('');
  loading = signal<boolean>(false);
  urlHistory = signal<ShortUrl[]>([]);

  ngOnInit() {
    this.loadHistory();
  }

  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  async shortenUrl() {
    if (!this.isValidUrl(this.urlInput)) {
      this.errorMessage.set('Please enter a valid URL');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    try {
      // For demo purposes, we'll create a simple short URL
      // In a real app, you'd call a URL shortening service
      const shortCode = this.generateShortCode();
      const shortUrl = `https://liil.co.in/s/${shortCode}`;
      
      this.shortenedUrl.set(shortUrl);
      this.originalUrl.set(this.urlInput);
      
      // Add to history
      const newUrl: ShortUrl = {
        original: this.urlInput,
        short: shortUrl,
        createdAt: new Date()
      };
      
      this.urlHistory.update(history => [newUrl, ...history.slice(0, 9)]);
      this.saveHistory();
      
    } catch (error) {
      this.errorMessage.set('Failed to shorten URL. Please try again.');
    }

    this.loading.set(false);
  }

  private generateShortCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async copyUrl() {
    if (this.shortenedUrl()) {
      try {
        await navigator.clipboard.writeText(this.shortenedUrl()!);
        console.log('URL copied to clipboard');
      } catch (error) {
        console.error('Failed to copy URL:', error);
      }
    }
  }

  async copyUrlFromHistory(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      console.log('URL copied to clipboard');
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  }

  deleteFromHistory(url: ShortUrl) {
    this.urlHistory.update(history => 
      history.filter(item => item !== url)
    );
    this.saveHistory();
  }

  clearHistory() {
    this.urlHistory.set([]);
    this.saveHistory();
  }

  getSavings(): number {
    const original = this.originalUrl().length;
    const shortened = this.shortenedUrl().length || 0;
    if (original === 0) return 0;
    return Math.round(((original - shortened) / original) * 100);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  trackByFn(index: number, item: ShortUrl) {
    return item.short;
  }

  private saveHistory() {
    localStorage.setItem('urlHistory', JSON.stringify(this.urlHistory()));
  }

  private loadHistory() {
    const saved = localStorage.getItem('urlHistory');
    if (saved) {
      try {
        const history = JSON.parse(saved);
        this.urlHistory.set(history.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt)
        })));
      } catch (error) {
        console.error('Failed to load URL history:', error);
      }
    }
  }
}
