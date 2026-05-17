import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

@Component({
  selector: 'app-audio-converter',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tool-container">
      <div class="glass-section header-section">
        <h2>🎵 Audio Converter</h2>
        <p>Convert audio files entirely in your browser.</p>
      </div>

      <div class="converter-card glass-card">
        <div *ngIf="loading()" class="loading-state">
          <div class="spinner"></div>
          <p>Loading local FFmpeg core...</p>
        </div>

        <div *ngIf="!loading()" class="converter-content">
          <div class="upload-area" (click)="fileInput.click()">
            <input #fileInput type="file" accept="audio/*" (change)="onFileSelected($event)" style="display: none;" />
            <div class="upload-icon">📤</div>
            <h3>{{ selectedFile() ? selectedFile()?.name : 'Click to select an audio file' }}</h3>
          </div>

          <div *ngIf="selectedFile()" class="conversion-controls">
            <div class="format-select">
              <label>Convert to:</label>
              <select (change)="onFormatChange($event)">
                <option value="mp3">MP3</option>
                <option value="wav">WAV</option>
                <option value="ogg">OGG</option>
                <option value="aac">AAC</option>
              </select>
            </div>
            
            <button class="btn-primary" (click)="convert()" [disabled]="converting()">
              {{ converting() ? 'Converting...' : 'Convert File' }}
            </button>
          </div>

          <div *ngIf="progress() > 0 && converting()" class="progress-bar-container">
            <div class="progress-bar" [style.width.%]="progress()"></div>
            <p>{{ progress().toFixed(0) }}%</p>
          </div>

          <div *ngIf="outputUrl()" class="result-area">
            <h3>Conversion Complete!</h3>
            <audio controls [src]="outputUrl()"></audio>
            <a class="btn-secondary" [href]="outputUrl()" [download]="outputFilename()">Download</a>
          </div>
          
          <div *ngIf="error()" class="error-message">
            ❌ {{ error() }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-container { max-width: 800px; margin: 0 auto; }
    .header-section { text-align: center; padding: 2rem; margin-bottom: 2rem; border-radius: 16px; }
    .header-section h2 { margin-bottom: 0.5rem; color: var(--text-primary); }
    .header-section p { color: var(--text-secondary); margin: 0; }
    
    .converter-card { padding: 2rem; border-radius: 16px; text-align: center; }
    
    .upload-area {
      border: 2px dashed var(--accent-pink);
      border-radius: 12px;
      padding: 3rem;
      cursor: pointer;
      transition: all 0.3s ease;
      background: var(--glass-bg-light);
      margin-bottom: 2rem;
    }
    .upload-area:hover { background: rgba(236, 72, 153, 0.1); }
    .upload-icon { font-size: 3rem; margin-bottom: 1rem; }
    .upload-area h3 { color: var(--text-primary); font-size: 1.2rem; margin: 0; word-break: break-all; }
    
    .conversion-controls {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      align-items: center;
    }
    .format-select {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .format-select select {
      padding: 0.5rem 1rem;
      border-radius: 8px;
      border: 1px solid var(--glass-border-light);
      background: var(--glass-bg-medium);
      color: var(--text-primary);
      font-size: 1rem;
    }
    
    .btn-primary, .btn-secondary {
      padding: 0.75rem 2rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
      text-decoration: none;
      display: inline-block;
    }
    .btn-primary { background: var(--accent-pink); color: white; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-secondary { background: var(--glass-bg-medium); color: var(--text-primary); }
    .btn-secondary:hover { background: var(--glass-bg-heavy); }
    
    .progress-bar-container { margin-top: 2rem; }
    .progress-bar {
      height: 8px;
      background: var(--accent-pink);
      border-radius: 4px;
      transition: width 0.2s ease;
    }
    
    .result-area {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid var(--glass-border-light);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
    }
    
    .error-message {
      margin-top: 1.5rem;
      color: #ff4b4b;
      background: rgba(255, 75, 75, 0.1);
      padding: 1rem;
      border-radius: 8px;
    }

    .spinner {
      width: 40px; height: 40px;
      border: 4px solid var(--glass-border-light);
      border-top: 4px solid var(--accent-pink);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  `]
})
export class AudioConverter {
  ffmpeg: FFmpeg | null = null;
  loading = signal(true);
  converting = signal(false);
  progress = signal(0);
  
  selectedFile = signal<File | null>(null);
  targetFormat = signal('mp3');
  outputUrl = signal<string | null>(null);
  outputFilename = signal<string>('');
  error = signal<string | null>(null);

  constructor() {
    this.initFFmpeg();
  }

  async initFFmpeg() {
    try {
      this.ffmpeg = new FFmpeg();
      this.ffmpeg.on('progress', ({ progress, time }) => {
        this.progress.set(progress * 100);
      });

      const baseURL = '/assets/ffmpeg';
      await this.ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
      });
      
      this.loading.set(false);
    } catch (err: any) {
      this.error.set("Failed to load FFmpeg. Check your connection or CORS policies.");
      this.loading.set(false);
      console.error(err);
    }
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedFile.set(file);
      this.outputUrl.set(null);
      this.error.set(null);
    }
  }

  onFormatChange(event: Event) {
    this.targetFormat.set((event.target as HTMLSelectElement).value);
  }

  async convert() {
    const file = this.selectedFile();
    if (!file || !this.ffmpeg) return;

    this.converting.set(true);
    this.progress.set(0);
    this.error.set(null);
    this.outputUrl.set(null);

    try {
      const inputName = 'input_' + file.name.replace(/\s+/g, '_');
      const outputName = 'output.' + this.targetFormat();
      
      await this.ffmpeg.writeFile(inputName, await fetchFile(file));
      
      await this.ffmpeg.exec(['-i', inputName, outputName]);
      
      const data = await this.ffmpeg.readFile(outputName);
      
      const blob = new Blob([(data as Uint8Array).buffer as any], { type: 'audio/' + this.targetFormat() });
      const url = URL.createObjectURL(blob);
      
      this.outputUrl.set(url);
      this.outputFilename.set(outputName);
    } catch (err: any) {
      this.error.set("Conversion failed. Please try a different file.");
      console.error(err);
    } finally {
      this.converting.set(false);
    }
  }
}
