import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-timestamp-converter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-container fade-in-up">
      <div class="tool-header">
        <div class="tool-icon-wrapper">
          <span class="tool-icon">🕒</span>
        </div>
        <div>
          <h2>Unix Timestamp Converter</h2>
          <p>Convert epochs to human-readable dates and vice versa</p>
        </div>
      </div>

      <div class="tool-content converter-grid">
        <!-- Epoch to Date -->
        <div class="glass-card section-card">
          <div class="card-header">
            <h3>Epoch to Date</h3>
            <button class="btn-primary small" (click)="setToNow()">Set to Now</button>
          </div>
          
          <div class="input-group">
            <label>Unix Timestamp (Seconds or Milliseconds)</label>
            <input type="number" [(ngModel)]="epochInput" (ngModelChange)="onEpochChange()" class="glass-input" placeholder="e.g. 1700000000">
          </div>

          <div class="output-group" *ngIf="parsedDate()">
            <div class="output-row">
              <span class="label">Local Time:</span>
              <span class="value">{{ localTime() }}</span>
            </div>
            <div class="output-row">
              <span class="label">UTC Time:</span>
              <span class="value">{{ utcTime() }}</span>
            </div>
            <div class="output-row">
              <span class="label">Relative:</span>
              <span class="value">{{ relativeTime() }}</span>
            </div>
          </div>
          <div class="error-msg" *ngIf="epochError()">Invalid timestamp</div>
        </div>

        <!-- Date to Epoch -->
        <div class="glass-card section-card">
          <div class="card-header">
            <h3>Date to Epoch</h3>
          </div>
          
          <div class="input-group">
            <label>Select Date & Time</label>
            <input type="datetime-local" [(ngModel)]="dateInput" (ngModelChange)="onDateChange()" class="glass-input">
          </div>

          <div class="output-group" *ngIf="generatedEpoch()">
            <div class="output-row">
              <span class="label">Epoch (Seconds):</span>
              <div class="value-with-copy">
                <span class="value">{{ generatedEpoch() }}</span>
                <button class="btn-icon" (click)="copyToClipboard(generatedEpoch()!.toString(), 'sec')">
                  <span class="icon">{{ copied() === 'sec' ? '✓' : '📋' }}</span>
                </button>
              </div>
            </div>
            <div class="output-row">
              <span class="label">Epoch (Millis):</span>
              <div class="value-with-copy">
                <span class="value">{{ generatedEpochMs() }}</span>
                <button class="btn-icon" (click)="copyToClipboard(generatedEpochMs()!.toString(), 'ms')">
                  <span class="icon">{{ copied() === 'ms' ? '✓' : '📋' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-container { max-width: 1000px; margin: 0 auto; padding: 2rem; }
    .converter-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
    .section-card { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
    .card-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 1rem; }
    .card-header h3 { margin: 0; color: var(--accent-cyan); }
    .btn-primary.small { padding: 0.4rem 1rem; font-size: 0.9rem; }
    .input-group { display: flex; flex-direction: column; gap: 0.5rem; }
    .input-group label { color: var(--text-secondary); font-size: 0.9rem; }
    .output-group { display: flex; flex-direction: column; gap: 1rem; background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px; }
    .output-row { display: flex; flex-direction: column; gap: 0.25rem; }
    .output-row .label { font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; }
    .output-row .value { font-family: monospace; font-size: 1.1rem; color: var(--text-primary); }
    .value-with-copy { display: flex; justify-content: space-between; align-items: center; }
    .btn-icon { background: transparent; border: none; color: var(--text-secondary); cursor: pointer; padding: 0.25rem; transition: color 0.3s; }
    .btn-icon:hover { color: var(--text-primary); }
    .error-msg { color: #ef4444; font-size: 0.9rem; }
    @media (max-width: 768px) { .converter-grid { grid-template-columns: 1fr; } }
  `]
})
export class TimestampConverterComponent {
  epochInput = signal<number | null>(null);
  parsedDate = signal<Date | null>(null);
  localTime = signal<string>('');
  utcTime = signal<string>('');
  relativeTime = signal<string>('');
  epochError = signal<boolean>(false);

  dateInput = signal<string>('');
  generatedEpoch = signal<number | null>(null);
  generatedEpochMs = signal<number | null>(null);

  copied = signal<string>('');

  constructor() {
    this.setToNow();
  }

  setToNow() {
    const now = new Date();
    this.epochInput.set(Math.floor(now.getTime() / 1000));
    this.onEpochChange();

    // Set date input to local datetime string (YYYY-MM-DDThh:mm)
    const tzoffset = now.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(now.getTime() - tzoffset)).toISOString().slice(0, 16);
    this.dateInput.set(localISOTime);
    this.onDateChange();
  }

  onEpochChange() {
    const val = this.epochInput();
    if (val === null || val === undefined || val === 0) {
      this.parsedDate.set(null);
      this.epochError.set(false);
      return;
    }

    try {
      // Auto-detect seconds vs ms (if > 100000000000, it's ms)
      const isMs = val > 100000000000;
      const ms = isMs ? val : val * 1000;
      const d = new Date(ms);
      
      if (isNaN(d.getTime())) throw new Error();

      this.parsedDate.set(d);
      this.localTime.set(d.toLocaleString());
      this.utcTime.set(d.toUTCString());
      this.relativeTime.set(this.getRelativeTimeString(d));
      this.epochError.set(false);
    } catch {
      this.parsedDate.set(null);
      this.epochError.set(true);
    }
  }

  onDateChange() {
    const val = this.dateInput();
    if (!val) {
      this.generatedEpoch.set(null);
      this.generatedEpochMs.set(null);
      return;
    }

    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      this.generatedEpochMs.set(d.getTime());
      this.generatedEpoch.set(Math.floor(d.getTime() / 1000));
    }
  }

  getRelativeTimeString(date: Date): string {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const daysDifference = Math.round((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    if (Math.abs(daysDifference) < 1) {
      const hoursDiff = Math.round((date.getTime() - new Date().getTime()) / (1000 * 60 * 60));
      if (Math.abs(hoursDiff) < 1) {
        const minDiff = Math.round((date.getTime() - new Date().getTime()) / (1000 * 60));
        return rtf.format(minDiff, 'minute');
      }
      return rtf.format(hoursDiff, 'hour');
    }
    return rtf.format(daysDifference, 'day');
  }

  copyToClipboard(text: string, type: string) {
    navigator.clipboard.writeText(text);
    this.copied.set(type);
    setTimeout(() => this.copied.set(''), 2000);
  }
}
