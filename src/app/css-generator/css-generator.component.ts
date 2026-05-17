import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-css-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-container fade-in-up">
      <div class="tool-header">
        <div class="tool-icon-wrapper">
          <span class="tool-icon">🎨</span>
        </div>
        <div>
          <h2>CSS Box Shadow Generator</h2>
          <p>Create and preview beautiful box shadows</p>
        </div>
      </div>

      <div class="tool-content generator-grid">
        <!-- Controls -->
        <div class="glass-card section-card">
          <div class="card-header">
            <h3>Shadow Settings</h3>
          </div>
          
          <div class="controls-list">
            <div class="control-group">
              <label>Horizontal Offset: {{ offsetX() }}px</label>
              <input type="range" min="-100" max="100" [(ngModel)]="offsetXInput" (ngModelChange)="offsetX.set($event)">
            </div>
            
            <div class="control-group">
              <label>Vertical Offset: {{ offsetY() }}px</label>
              <input type="range" min="-100" max="100" [(ngModel)]="offsetYInput" (ngModelChange)="offsetY.set($event)">
            </div>
            
            <div class="control-group">
              <label>Blur Radius: {{ blur() }}px</label>
              <input type="range" min="0" max="150" [(ngModel)]="blurInput" (ngModelChange)="blur.set($event)">
            </div>
            
            <div class="control-group">
              <label>Spread Radius: {{ spread() }}px</label>
              <input type="range" min="-50" max="100" [(ngModel)]="spreadInput" (ngModelChange)="spread.set($event)">
            </div>
            
            <div class="control-group color-group">
              <label>Shadow Color:</label>
              <input type="color" [(ngModel)]="shadowColorInput" (ngModelChange)="shadowColor.set($event)">
              <div class="opacity-control">
                <label>Opacity: {{ shadowOpacity() }}</label>
                <input type="range" min="0" max="1" step="0.01" [(ngModel)]="shadowOpacityInput" (ngModelChange)="shadowOpacity.set($event)">
              </div>
            </div>
            
            <div class="control-group checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="insetInput" (ngModelChange)="inset.set($event)"> Inset Shadow
              </label>
            </div>
          </div>
        </div>

        <!-- Preview & Output -->
        <div class="preview-section">
          <div class="glass-card section-card preview-card" [style.backgroundColor]="boxBg()">
            <div class="preview-box" [style.backgroundColor]="boxColor()" [style.boxShadow]="boxShadowCSS()"></div>
          </div>
          
          <div class="glass-card section-card output-card">
            <div class="card-header">
              <h3>CSS Code</h3>
              <button class="btn-icon" (click)="copyToClipboard()">
                <span class="icon">{{ copied() ? '✓' : '📋' }}</span>
              </button>
            </div>
            <pre class="css-output">{{ boxShadowCode() }}</pre>
          </div>
          
          <div class="glass-card section-card colors-card">
            <div class="color-pickers">
              <div class="control-group">
                <label>Box Color</label>
                <input type="color" [(ngModel)]="boxColorInput" (ngModelChange)="boxColor.set($event)">
              </div>
              <div class="control-group">
                <label>Background</label>
                <input type="color" [(ngModel)]="boxBgInput" (ngModelChange)="boxBg.set($event)">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-container { max-width: 1100px; margin: 0 auto; padding: 2rem; }
    .generator-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
    .section-card { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
    .card-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 1rem; }
    .card-header h3 { margin: 0; color: var(--accent-cyan); }
    
    .controls-list { display: flex; flex-direction: column; gap: 1.5rem; }
    .control-group { display: flex; flex-direction: column; gap: 0.5rem; }
    .control-group label { color: var(--text-secondary); font-size: 0.95rem; font-weight: 500; }
    input[type=range] { width: 100%; accent-color: var(--accent-pink); }
    input[type=color] { width: 100%; height: 40px; border: none; border-radius: 8px; cursor: pointer; background: transparent; }
    
    .color-group { display: flex; flex-direction: column; gap: 1rem; background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px; }
    .opacity-control { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem; }
    
    .checkbox-label { display: flex !important; flex-direction: row !important; align-items: center; gap: 0.5rem; cursor: pointer; }
    .checkbox-label input { width: 1.2rem; height: 1.2rem; accent-color: var(--accent-cyan); }
    
    .preview-section { display: flex; flex-direction: column; gap: 2rem; }
    .preview-card { min-height: 300px; display: flex; align-items: center; justify-content: center; overflow: hidden; transition: background-color 0.3s; }
    .preview-box { width: 200px; height: 200px; border-radius: 16px; transition: all 0.2s ease-out; }
    
    .css-output { background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 8px; font-family: monospace; color: #a5b4fc; font-size: 1rem; margin: 0; white-space: pre-wrap; word-break: break-all; }
    .btn-icon { background: transparent; border: none; color: var(--text-secondary); cursor: pointer; font-size: 1.2rem; transition: color 0.3s; }
    .btn-icon:hover { color: var(--text-primary); }
    
    .color-pickers { display: flex; gap: 2rem; }
    .color-pickers .control-group { flex: 1; }

    @media (max-width: 1024px) { .generator-grid { grid-template-columns: 1fr; } }
  `]
})
export class CssGeneratorComponent {
  // Shadow state
  offsetXInput = 10; offsetX = signal<number>(10);
  offsetYInput = 10; offsetY = signal<number>(10);
  blurInput = 25; blur = signal<number>(25);
  spreadInput = -5; spread = signal<number>(-5);
  shadowColorInput = '#000000'; shadowColor = signal<string>('#000000');
  shadowOpacityInput = 0.5; shadowOpacity = signal<number>(0.5);
  insetInput = false; inset = signal<boolean>(false);

  // Box state
  boxColorInput = '#3f3f46'; boxColor = signal<string>('#3f3f46');
  boxBgInput = '#18181b'; boxBg = signal<string>('#18181b');

  copied = signal<boolean>(false);

  // Convert hex + opacity to rgba
  rgbaColor = computed(() => {
    const hex = this.shadowColor().replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${this.shadowOpacity()})`;
  });

  boxShadowCSS = computed(() => {
    const isInset = this.inset() ? 'inset ' : '';
    return `${isInset}${this.offsetX()}px ${this.offsetY()}px ${this.blur()}px ${this.spread()}px ${this.rgbaColor()}`;
  });

  boxShadowCode = computed(() => {
    return `box-shadow: ${this.boxShadowCSS()};\n-webkit-box-shadow: ${this.boxShadowCSS()};\n-moz-box-shadow: ${this.boxShadowCSS()};`;
  });

  copyToClipboard() {
    navigator.clipboard.writeText(this.boxShadowCode());
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }
}
