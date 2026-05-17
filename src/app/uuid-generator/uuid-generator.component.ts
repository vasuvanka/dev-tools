import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-uuid-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-container fade-in-up">
      <div class="tool-header">
        <div class="tool-icon-wrapper">
          <span class="tool-icon">🆔</span>
        </div>
        <div>
          <h2>UUID & Password Generator</h2>
          <p>Generate secure random strings and identifiers</p>
        </div>
      </div>

      <div class="tool-content generator-grid">
        <!-- UUID Section -->
        <div class="glass-card section-card">
          <div class="card-header">
            <h3>UUID v4 Generator</h3>
            <button class="btn-primary small" (click)="generateUuids()">Generate New</button>
          </div>
          
          <div class="controls">
            <label>
              Count: {{ uuidCount() }}
              <input type="range" min="1" max="20" [(ngModel)]="uuidCountInput" (ngModelChange)="onUuidCountChange($event)">
            </label>
          </div>

          <div class="output-list">
            <div class="output-item" *ngFor="let id of uuids()">
              <span class="value">{{ id }}</span>
              <button class="btn-icon" (click)="copyToClipboard(id, id)">
                <span class="icon">{{ copied() === id ? '✓' : '📋' }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Password Section -->
        <div class="glass-card section-card">
          <div class="card-header">
            <h3>Secure Password Generator</h3>
            <button class="btn-primary small" (click)="generatePasswords()">Generate New</button>
          </div>
          
          <div class="controls password-controls">
            <div class="control-group">
              <label>
                Length: {{ pwdLength() }}
                <input type="range" min="8" max="64" [(ngModel)]="pwdLengthInput" (ngModelChange)="onPwdLengthChange($event)">
              </label>
            </div>
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="pwdUppercase" (change)="generatePasswords()"> Uppercase (A-Z)
              </label>
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="pwdNumbers" (change)="generatePasswords()"> Numbers (0-9)
              </label>
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="pwdSymbols" (change)="generatePasswords()"> Symbols (!@#$)
              </label>
            </div>
          </div>

          <div class="output-list">
            <div class="output-item" *ngFor="let pwd of passwords()">
              <span class="value">{{ pwd }}</span>
              <button class="btn-icon" (click)="copyToClipboard(pwd, pwd)">
                <span class="icon">{{ copied() === pwd ? '✓' : '📋' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    .generator-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }
    .section-card {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      padding-bottom: 1rem;
    }
    .card-header h3 {
      margin: 0;
      color: var(--accent-cyan);
    }
    .btn-primary.small {
      padding: 0.4rem 1rem;
      font-size: 0.9rem;
    }
    
    .controls {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
      background: rgba(0,0,0,0.2);
      border-radius: 12px;
    }
    .controls label {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      color: var(--text-secondary);
      font-weight: 500;
    }
    .password-controls {
      gap: 1.5rem;
    }
    .checkbox-group {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.75rem;
    }
    .checkbox-label {
      flex-direction: row !important;
      align-items: center;
      cursor: pointer;
    }
    .checkbox-label input {
      width: 1.2rem;
      height: 1.2rem;
      accent-color: var(--accent-cyan);
    }
    
    input[type=range] {
      width: 100%;
      accent-color: var(--accent-pink);
    }

    .output-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .output-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(255,255,255,0.05);
      padding: 0.75rem 1rem;
      border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.05);
    }
    .output-item .value {
      font-family: monospace;
      font-size: 1.1rem;
      color: var(--text-primary);
      word-break: break-all;
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

    @media (max-width: 1024px) {
      .generator-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class UuidGeneratorComponent {
  // UUID State
  uuidCountInput = 5;
  uuidCount = signal<number>(5);
  uuids = signal<string[]>([]);

  // Password State
  pwdLengthInput = 16;
  pwdLength = signal<number>(16);
  pwdUppercase = true;
  pwdNumbers = true;
  pwdSymbols = true;
  passwords = signal<string[]>([]);

  copied = signal<string>('');

  constructor() {
    this.generateUuids();
    this.generatePasswords();
  }

  onUuidCountChange(val: number) {
    this.uuidCount.set(val);
    this.generateUuids();
  }

  onPwdLengthChange(val: number) {
    this.pwdLength.set(val);
    this.generatePasswords();
  }

  generateUuids() {
    const count = this.uuidCount();
    const newUuids = [];
    for (let i = 0; i < count; i++) {
      newUuids.push(crypto.randomUUID());
    }
    this.uuids.set(newUuids);
  }

  generatePasswords() {
    const count = 5; // generate 5 at a time
    const length = this.pwdLength();
    
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
    
    let chars = lowercase;
    if (this.pwdUppercase) chars += uppercase;
    if (this.pwdNumbers) chars += numbers;
    if (this.pwdSymbols) chars += symbols;

    // Handle edge case where no chars selected
    if (!chars) {
      this.passwords.set(['Please select at least one character type']);
      return;
    }

    const newPwds = [];
    for (let i = 0; i < count; i++) {
      let pwd = '';
      const array = new Uint32Array(length);
      crypto.getRandomValues(array);
      for (let j = 0; j < length; j++) {
        pwd += chars[array[j] % chars.length];
      }
      newPwds.push(pwd);
    }
    this.passwords.set(newPwds);
  }

  copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    this.copied.set(id);
    setTimeout(() => this.copied.set(''), 2000);
  }
}
