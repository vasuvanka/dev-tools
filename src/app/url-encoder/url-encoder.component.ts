import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-url-encoder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-container fade-in-up">
      <div class="tool-header">
        <div class="tool-icon-wrapper">
          <span class="tool-icon">🔗</span>
        </div>
        <div>
          <h2>URL Encoder / Decoder</h2>
          <p>Safely encode and decode URL components</p>
        </div>
      </div>

      <div class="tool-content">
        <div class="glass-card section-card mb-6">
          <div class="tabs">
            <button class="tab-btn" [class.active]="mode() === 'encode'" (click)="setMode('encode')">Encode</button>
            <button class="tab-btn" [class.active]="mode() === 'decode'" (click)="setMode('decode')">Decode</button>
          </div>
          
          <div class="input-section">
            <textarea
              [(ngModel)]="inputText"
              (ngModelChange)="processText()"
              class="glass-input big-input"
              [placeholder]="mode() === 'encode' ? 'Paste text to encode into a URL-safe format...' : 'Paste URL-encoded string here to decode it...'"
            ></textarea>
          </div>
        </div>

        <div class="glass-card section-card output-section">
          <div class="card-header">
            <h3>Output</h3>
            <button class="btn-icon" (click)="copyToClipboard()" *ngIf="outputText()">
              <span class="icon">{{ copied() ? '✓ Copied' : '📋 Copy' }}</span>
            </button>
          </div>
          
          <div class="output-box" [class.error]="hasError()">
            {{ outputText() || 'Output will appear here...' }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-container { max-width: 900px; margin: 0 auto; padding: 2rem; }
    .section-card { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
    .mb-6 { margin-bottom: 1.5rem; }
    
    .tabs { display: flex; gap: 1rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 1rem; }
    .tab-btn { background: transparent; border: none; color: var(--text-secondary); font-size: 1.1rem; font-weight: 600; cursor: pointer; padding: 0.5rem 1rem; border-radius: 8px; transition: all 0.3s; }
    .tab-btn:hover { background: rgba(255,255,255,0.05); }
    .tab-btn.active { color: var(--accent-cyan); background: rgba(34, 211, 238, 0.1); }
    
    .big-input { width: 100%; min-height: 200px; font-family: monospace; font-size: 1rem; resize: vertical; }
    
    .card-header { display: flex; justify-content: space-between; align-items: center; }
    .card-header h3 { margin: 0; color: var(--accent-cyan); }
    
    .output-box { min-height: 150px; background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px; font-family: monospace; font-size: 1rem; color: var(--text-primary); word-break: break-all; white-space: pre-wrap; }
    .output-box.error { color: #ef4444; }
    
    .btn-icon { background: transparent; border: none; color: var(--text-secondary); cursor: pointer; font-size: 1rem; padding: 0.25rem 0.5rem; transition: color 0.3s; display: flex; align-items: center; gap: 0.5rem; }
    .btn-icon:hover { color: var(--text-primary); }
  `]
})
export class UrlEncoderComponent {
  mode = signal<'encode' | 'decode'>('encode');
  inputText = signal<string>('');
  outputText = signal<string>('');
  hasError = signal<boolean>(false);
  copied = signal<boolean>(false);

  setMode(newMode: 'encode' | 'decode') {
    this.mode.set(newMode);
    
    // Swap input and output for convenience
    const currentOut = this.outputText();
    if (currentOut && !this.hasError()) {
      this.inputText.set(currentOut);
    }
    
    this.processText();
  }

  processText() {
    const text = this.inputText();
    if (!text) {
      this.outputText.set('');
      this.hasError.set(false);
      return;
    }

    try {
      if (this.mode() === 'encode') {
        this.outputText.set(encodeURIComponent(text));
      } else {
        this.outputText.set(decodeURIComponent(text));
      }
      this.hasError.set(false);
    } catch (e) {
      this.outputText.set('Error decoding string. It may be malformed.');
      this.hasError.set(true);
    }
  }

  copyToClipboard() {
    if (!this.outputText() || this.hasError()) return;
    navigator.clipboard.writeText(this.outputText());
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }
}
