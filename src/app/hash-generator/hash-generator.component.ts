import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-hash-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-container fade-in-up">
      <div class="tool-header">
        <div class="tool-icon-wrapper">
          <span class="tool-icon">🧬</span>
        </div>
        <div>
          <h2>Hash Generator</h2>
          <p>Generate cryptographic hashes from text</p>
        </div>
      </div>

      <div class="tool-content">
        <div class="glass-card p-6 mb-6">
          <textarea
            [(ngModel)]="inputText"
            (ngModelChange)="generateHashes()"
            class="glass-input hash-input"
            placeholder="Type or paste text here to generate hashes..."
            rows="6"
          ></textarea>
        </div>

        <div class="hashes-grid">
          <div class="hash-card glass-card">
            <div class="hash-header">
              <h3>SHA-1</h3>
              <button class="btn-icon" (click)="copyToClipboard(sha1Hash(), 'sha1')">
                <span class="icon">{{ copied() === 'sha1' ? '✓' : '📋' }}</span>
              </button>
            </div>
            <div class="hash-value">{{ sha1Hash() || '...' }}</div>
          </div>

          <div class="hash-card glass-card">
            <div class="hash-header">
              <h3>SHA-256</h3>
              <button class="btn-icon" (click)="copyToClipboard(sha256Hash(), 'sha256')">
                <span class="icon">{{ copied() === 'sha256' ? '✓' : '📋' }}</span>
              </button>
            </div>
            <div class="hash-value">{{ sha256Hash() || '...' }}</div>
          </div>

          <div class="hash-card glass-card">
            <div class="hash-header">
              <h3>SHA-384</h3>
              <button class="btn-icon" (click)="copyToClipboard(sha384Hash(), 'sha384')">
                <span class="icon">{{ copied() === 'sha384' ? '✓' : '📋' }}</span>
              </button>
            </div>
            <div class="hash-value">{{ sha384Hash() || '...' }}</div>
          </div>

          <div class="hash-card glass-card">
            <div class="hash-header">
              <h3>SHA-512</h3>
              <button class="btn-icon" (click)="copyToClipboard(sha512Hash(), 'sha512')">
                <span class="icon">{{ copied() === 'sha512' ? '✓' : '📋' }}</span>
              </button>
            </div>
            <div class="hash-value">{{ sha512Hash() || '...' }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 2rem;
    }
    .hash-input {
      width: 100%;
      font-size: 1.1rem;
      resize: vertical;
    }
    .p-6 {
      padding: 1.5rem;
    }
    .mb-6 {
      margin-bottom: 1.5rem;
    }
    .hashes-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
    }
    .hash-card {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .hash-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .hash-header h3 {
      margin: 0;
      font-size: 1rem;
      color: var(--accent-cyan);
      letter-spacing: 1px;
    }
    .hash-value {
      font-family: monospace;
      font-size: 1.1rem;
      word-break: break-all;
      color: var(--text-primary);
      padding: 0.75rem;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
    }
    .btn-icon {
      background: transparent;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      font-size: 1.2rem;
      padding: 0.25rem;
      transition: color 0.3s;
    }
    .btn-icon:hover {
      color: var(--text-primary);
    }
  `]
})
export class HashGeneratorComponent {
  inputText = signal<string>('');
  
  sha1Hash = signal<string>('');
  sha256Hash = signal<string>('');
  sha384Hash = signal<string>('');
  sha512Hash = signal<string>('');
  
  copied = signal<string>('');

  async generateHashes() {
    const text = this.inputText();
    if (!text) {
      this.sha1Hash.set('');
      this.sha256Hash.set('');
      this.sha384Hash.set('');
      this.sha512Hash.set('');
      return;
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    // Using Promise.all to generate hashes concurrently
    const [sha1, sha256, sha384, sha512] = await Promise.all([
      crypto.subtle.digest('SHA-1', data).then(this.buf2hex),
      crypto.subtle.digest('SHA-256', data).then(this.buf2hex),
      crypto.subtle.digest('SHA-384', data).then(this.buf2hex),
      crypto.subtle.digest('SHA-512', data).then(this.buf2hex)
    ]);

    this.sha1Hash.set(sha1);
    this.sha256Hash.set(sha256);
    this.sha384Hash.set(sha384);
    this.sha512Hash.set(sha512);
  }

  private buf2hex = (buffer: ArrayBuffer): string => {
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
  }

  copyToClipboard(text: string, type: string) {
    if (!text) return;
    navigator.clipboard.writeText(text);
    this.copied.set(type);
    setTimeout(() => this.copied.set(''), 2000);
  }
}
