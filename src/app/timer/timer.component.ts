import { Component, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="timer-container">
      <div class="timer-header">
        <h1>⏰ Timer</h1>
        <p>Set a countdown timer with beep notification</p>
      </div>
      
      <div class="timer-display">
        <div class="time-circle" [class.running]="isRunning()" [class.finished]="timeRemaining() === 0">
          <div class="time-text">
            {{ formatTime(timeRemaining()) }}
          </div>
          <div class="time-label">
            {{ isRunning() ? 'Running' : timeRemaining() === 0 ? 'Finished!' : 'Ready' }}
          </div>
        </div>
      </div>
      
      <div class="timer-controls">
        <div class="time-inputs">
          <div class="input-group">
            <label>Hours</label>
            <input 
              type="number" 
              [(ngModel)]="hours" 
              min="0" 
              max="23" 
              class="time-input"
              [disabled]="isRunning()"
            >
          </div>
          <div class="input-group">
            <label>Minutes</label>
            <input 
              type="number" 
              [(ngModel)]="minutes" 
              min="0" 
              max="59" 
              class="time-input"
              [disabled]="isRunning()"
            >
          </div>
          <div class="input-group">
            <label>Seconds</label>
            <input 
              type="number" 
              [(ngModel)]="seconds" 
              min="0" 
              max="59" 
              class="time-input"
              [disabled]="isRunning()"
            >
          </div>
        </div>
        
        <div class="control-buttons">
          <button 
            (click)="startTimer()" 
            class="control-button start"
            [disabled]="isRunning() || getTotalSeconds() === 0"
          >
            ▶️ Start
          </button>
          <button 
            (click)="pauseTimer()" 
            class="control-button pause"
            [disabled]="!isRunning()"
          >
            ⏸️ Pause
          </button>
          <button 
            (click)="resetTimer()" 
            class="control-button reset"
          >
            🔄 Reset
          </button>
        </div>
      </div>
      
      <div class="preset-timers">
        <h3>Quick Presets</h3>
        <div class="preset-buttons">
          <button 
            *ngFor="let preset of presets" 
            (click)="setPreset(preset)"
            class="preset-button"
            [disabled]="isRunning()"
          >
            {{ preset.name }}
          </button>
        </div>
      </div>
      
      <div class="timer-settings">
        <h3>Settings</h3>
        <div class="setting-item">
          <label>
            <input 
              type="checkbox" 
              [(ngModel)]="playBeep"
              class="checkbox"
            >
            Play beep when timer ends
          </label>
        </div>
        <div class="setting-item">
          <label>
            <input 
              type="checkbox" 
              [(ngModel)]="showNotification"
              class="checkbox"
            >
            Show browser notification
          </label>
        </div>
      </div>
      
      <div *ngIf="timeRemaining() === 0 && isRunning()" class="timer-finished">
        <h2>🎉 Timer Finished!</h2>
        <p>Your countdown has completed.</p>
      </div>
    </div>
  `,
  styles: [`
    .timer-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 2rem;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    
    .timer-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    
    .timer-header h1 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 2rem;
    }
    
    .timer-header p {
      margin: 0;
      color: #666;
    }
    
    .timer-display {
      display: flex;
      justify-content: center;
      margin-bottom: 2rem;
    }
    
    .time-circle {
      width: 200px;
      height: 200px;
      border-radius: 50%;
      border: 8px solid #e0e0e0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      background: white;
    }
    
    .time-circle.running {
      border-color: #4CAF50;
      box-shadow: 0 0 20px rgba(76, 175, 80, 0.3);
    }
    
    .time-circle.finished {
      border-color: #ff4757;
      box-shadow: 0 0 20px rgba(255, 71, 87, 0.3);
      animation: pulse 1s infinite;
    }
    
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
    
    .time-text {
      font-size: 2.5rem;
      font-weight: 700;
      color: #333;
      font-family: 'Courier New', monospace;
    }
    
    .time-label {
      font-size: 0.9rem;
      color: #666;
      margin-top: 0.5rem;
    }
    
    .timer-controls {
      margin-bottom: 2rem;
    }
    
    .time-inputs {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    
    .input-group {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .input-group label {
      font-weight: 600;
      color: #666;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }
    
    .time-input {
      width: 80px;
      padding: 0.75rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      text-align: center;
      font-size: 1.2rem;
      font-weight: 600;
      outline: none;
      transition: border-color 0.3s ease;
    }
    
    .time-input:focus {
      border-color: #667eea;
    }
    
    .time-input:disabled {
      background: #f8f9fa;
      color: #666;
    }
    
    .control-buttons {
      display: flex;
      justify-content: center;
      gap: 1rem;
    }
    
    .control-button {
      padding: 1rem 2rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 1rem;
    }
    
    .control-button.start {
      background: #4CAF50;
      color: white;
    }
    
    .control-button.start:hover:not(:disabled) {
      background: #45a049;
    }
    
    .control-button.pause {
      background: #ff9800;
      color: white;
    }
    
    .control-button.pause:hover:not(:disabled) {
      background: #f57c00;
    }
    
    .control-button.reset {
      background: #f44336;
      color: white;
    }
    
    .control-button.reset:hover {
      background: #d32f2f;
    }
    
    .control-button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    
    .preset-timers {
      margin-bottom: 2rem;
    }
    
    .preset-timers h3 {
      margin: 0 0 1rem 0;
      color: #333;
      text-align: center;
    }
    
    .preset-buttons {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.5rem;
    }
    
    .preset-button {
      padding: 0.5rem 1rem;
      background: #f8f9fa;
      border: 1px solid #e0e0e0;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.9rem;
    }
    
    .preset-button:hover:not(:disabled) {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }
    
    .preset-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .timer-settings {
      margin-bottom: 2rem;
    }
    
    .timer-settings h3 {
      margin: 0 0 1rem 0;
      color: #333;
      text-align: center;
    }
    
    .setting-item {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.5rem;
    }
    
    .setting-item label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-weight: 500;
    }
    
    .checkbox {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }
    
    .timer-finished {
      text-align: center;
      padding: 2rem;
      background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
      color: white;
      border-radius: 12px;
      animation: celebration 2s ease-in-out;
    }
    
    @keyframes celebration {
      0% { transform: scale(0.8); opacity: 0; }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); opacity: 1; }
    }
    
    .timer-finished h2 {
      margin: 0 0 0.5rem 0;
      font-size: 2rem;
    }
    
    .timer-finished p {
      margin: 0;
      font-size: 1.1rem;
    }
    
    @media (max-width: 768px) {
      .timer-container {
        padding: 1rem;
      }
      
      .time-circle {
        width: 150px;
        height: 150px;
      }
      
      .time-text {
        font-size: 2rem;
      }
      
      .time-inputs {
        gap: 0.5rem;
      }
      
      .time-input {
        width: 60px;
        padding: 0.5rem;
      }
      
      .control-buttons {
        flex-direction: column;
        align-items: center;
      }
      
      .control-button {
        width: 200px;
      }
    }
  `]
})
export class TimerComponent implements OnDestroy {
  hours = 0;
  minutes = 0;
  seconds = 0;
  timeRemaining = signal<number>(0);
  isRunning = signal<boolean>(false);
  playBeep = true;
  showNotification = true;
  private intervalId: number | null = null;

  presets = [
    { name: '1 min', hours: 0, minutes: 1, seconds: 0 },
    { name: '5 min', hours: 0, minutes: 5, seconds: 0 },
    { name: '10 min', hours: 0, minutes: 10, seconds: 0 },
    { name: '15 min', hours: 0, minutes: 15, seconds: 0 },
    { name: '30 min', hours: 0, minutes: 30, seconds: 0 },
    { name: '1 hour', hours: 1, minutes: 0, seconds: 0 }
  ];

  ngOnDestroy() {
    this.clearInterval();
  }

  getTotalSeconds(): number {
    return this.hours * 3600 + this.minutes * 60 + this.seconds;
  }

  setPreset(preset: any) {
    this.hours = preset.hours;
    this.minutes = preset.minutes;
    this.seconds = preset.seconds;
    this.timeRemaining.set(this.getTotalSeconds());
  }

  startTimer() {
    if (this.getTotalSeconds() === 0) return;
    
    this.timeRemaining.set(this.getTotalSeconds());
    this.isRunning.set(true);
    this.startCountdown();
  }

  pauseTimer() {
    this.isRunning.set(false);
    this.clearInterval();
  }

  resetTimer() {
    this.isRunning.set(false);
    this.clearInterval();
    this.timeRemaining.set(0);
    this.hours = 0;
    this.minutes = 0;
    this.seconds = 0;
  }

  private startCountdown() {
    this.clearInterval();
    this.intervalId = window.setInterval(() => {
      if (this.timeRemaining() <= 0) {
        this.timerFinished();
        return;
      }
      
      this.timeRemaining.update(time => time - 1);
    }, 1000);
  }

  private clearInterval() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private timerFinished() {
    this.isRunning.set(false);
    this.clearInterval();
    
    if (this.playBeep) {
      this.playBeepSound();
    }
    
    if (this.showNotification) {
      this.showBrowserNotification();
    }
  }

  private playBeepSound() {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  }

  private async showBrowserNotification() {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Timer Finished!', {
          body: 'Your countdown timer has completed.',
          icon: '/favicon.ico'
        });
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification('Timer Finished!', {
            body: 'Your countdown timer has completed.',
            icon: '/favicon.ico'
          });
        }
      }
    }
  }

  formatTime(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  }
}
