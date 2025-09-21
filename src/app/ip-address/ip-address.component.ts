import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ip-address',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ip-container">
      <div class="ip-content glass-card">
        <div class="ip-header">
          <h1>🌐 IP Address Checker</h1>
          <p>Check your current network IP address</p>
        </div>
        
        <div class="ip-cards">
          <div class="ip-card glass-section">
            <h3>Your Public IP</h3>
            <div class="ip-display">
              <span class="ip-address glass-medium">{{ publicIP() || 'Loading...' }}</span>
              <button (click)="copyToClipboard(publicIP())" class="copy-button glass-button" [disabled]="!publicIP()">
                📋 Copy
              </button>
            </div>
          </div>
          
          <div class="ip-card glass-section">
            <h3>Your Local IP</h3>
            <div class="ip-display">
              <span class="ip-address glass-medium">{{ localIP() || 'Not available' }}</span>
              <button (click)="copyToClipboard(localIP())" class="copy-button glass-button" [disabled]="!localIP()">
                📋 Copy
              </button>
            </div>
          </div>
        </div>
        
        <div class="ip-info glass-section">
          <h3>Network Information</h3>
          <div class="info-grid">
            <div class="info-item glass-light">
              <span class="info-label">User Agent:</span>
              <span class="info-value">{{ userAgent() }}</span>
            </div>
            <div class="info-item glass-light">
              <span class="info-label">Language:</span>
              <span class="info-value">{{ language() }}</span>
            </div>
            <div class="info-item glass-light">
              <span class="info-label">Platform:</span>
              <span class="info-value">{{ platform() }}</span>
            </div>
            <div class="info-item glass-light">
              <span class="info-label">Online Status:</span>
              <span class="info-value" [class.online]="isOnline()" [class.offline]="!isOnline()">
                {{ isOnline() ? 'Online' : 'Offline' }}
              </span>
            </div>
          </div>
        </div>
      
      </div>
    </div>
  `,
  styles: [`
    .ip-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    .ip-content {
      padding: 2rem;
    }
    
    .ip-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    
    .ip-header h1 {
      margin: 0 0 0.5rem 0;
      color: var(--text-primary);
      font-size: 2rem;
    }
    
    .ip-header p {
      margin: 0;
      color: var(--text-secondary);
    }
    
    .ip-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
    }
    
    .ip-card h3 {
      margin: 0 0 1rem 0;
      color: var(--text-primary);
      font-size: 1.2rem;
    }
    
    .ip-display {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .ip-address {
      font-family: 'Courier New', monospace;
      font-size: 1.2rem;
      font-weight: 600;
      color: var(--text-primary);
      padding: 0.75rem 1rem;
      border-radius: 8px;
      flex: 1;
      word-break: break-all;
    }
    
    .copy-button {
      padding: 0.75rem 1rem;
    }
    
    .ip-info h3 {
      margin: 0 0 1rem 0;
      color: var(--text-primary);
      font-size: 1.2rem;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }
    
    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding: 1rem;
      border-radius: 8px;
    }
    
    .info-label {
      font-weight: 600;
      color: var(--text-secondary);
      font-size: 0.9rem;
    }
    
    .info-value {
      font-family: 'Courier New', monospace;
      color: var(--text-primary);
      word-break: break-all;
    }
    
    .online {
      color: #4CAF50;
      font-weight: 600;
    }
    
    .offline {
      color: #ff4757;
      font-weight: 600;
    }
    
    .refresh-section {
      text-align: center;
    }
    
    .refresh-button {
      padding: 1rem 2rem;
      background: var(--gradient-success);
      color: white;
      font-size: 1rem;
    }
    
    @media (max-width: 768px) {
      .ip-container {
        padding: 1rem;
      }
      
      .ip-content {
        padding: 1rem;
      }
      
      .ip-display {
        flex-direction: column;
        align-items: stretch;
      }
      
      .info-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class IpAddressComponent implements OnInit {
  publicIP = signal<string>('');
  localIP = signal<string>('');
  userAgent = signal<string>('');
  language = signal<string>('');
  platform = signal<string>('');
  isOnline = signal<boolean>(true);
  loading = signal<boolean>(false);

  ngOnInit() {
    this.loadBrowserInfo();
    this.refreshIP();
  }

  async refreshIP() {
    this.loading.set(true);
    try {
      // Get public IP
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      this.publicIP.set(data.ip);
    } catch (error) {
      console.error('Error fetching public IP:', error);
      this.publicIP.set('Unable to fetch');
    }
    this.loading.set(false);
  }

  private loadBrowserInfo() {
    this.userAgent.set(navigator.userAgent);
    this.language.set(navigator.language);
    this.platform.set(navigator.platform);
    this.isOnline.set(navigator.onLine);
    
    // Try to get local IP using WebRTC
    this.getLocalIP();
  }

  private async getLocalIP() {
    return new Promise<void>((resolve) => {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      
      pc.createDataChannel('');
      pc.createOffer().then(offer => pc.setLocalDescription(offer));
      
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const candidate = event.candidate.candidate;
          const ipMatch = candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);
          if (ipMatch) {
            this.localIP.set(ipMatch[1]);
            pc.close();
            resolve();
          }
        }
      };
      
      // Timeout after 5 seconds
      setTimeout(() => {
        this.localIP.set('Unable to detect');
        pc.close();
        resolve();
      }, 5000);
    });
  }

  async copyToClipboard(text: string) {
    if (!text) return;
    
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
      console.log('Copied to clipboard:', text);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  }
}
