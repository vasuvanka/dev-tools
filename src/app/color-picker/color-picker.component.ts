import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ColorFormat {
  name: string;
  value: string;
  description: string;
}

@Component({
  selector: 'app-color-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="color-container">
      <div class="color-header">
        <h1>🎨 Color Picker & Converter</h1>
        <p>Pick colors and convert between different formats</p>
      </div>
      
      <div class="color-content">
        <div class="color-picker-section">
          <h3>Color Picker</h3>
          <div class="picker-container">
            <input 
              type="color" 
              [(ngModel)]="selectedColor" 
              (input)="onColorChange()"
              class="color-picker"
            >
            <div class="color-preview" [style.background-color]="selectedColor">
              <span class="color-text">{{ selectedColor.toUpperCase() }}</span>
            </div>
          </div>
        </div>
        
        <div class="color-formats">
          <h3>Color Formats</h3>
          <div class="formats-grid">
            <div class="format-item" *ngFor="let format of colorFormats()">
              <div class="format-header">
                <span class="format-name">{{ format.name }}</span>
                <button (click)="copyFormat(format)" class="copy-button">
                  📋 Copy
                </button>
              </div>
              <div class="format-value">{{ format.value }}</div>
              <div class="format-description">{{ format.description }}</div>
            </div>
          </div>
        </div>
        
        <div class="color-palette">
          <h3>Color Palette</h3>
          <div class="palette-grid">
            <div 
              *ngFor="let color of colorPalette" 
              class="palette-color"
              [style.background-color]="color.hex"
              (click)="selectColor(color.hex)"
              [class.selected]="selectedColor === color.hex"
            >
              <span class="color-name">{{ color.name }}</span>
              <span class="color-hex">{{ color.hex }}</span>
            </div>
          </div>
        </div>
        
        <div class="color-harmony">
          <h3>Color Harmony</h3>
          <div class="harmony-options">
            <button 
              *ngFor="let harmony of harmonyTypes" 
              (click)="generateHarmony(harmony.type)"
              class="harmony-button"
            >
              {{ harmony.name }}
            </button>
          </div>
          <div class="harmony-colors" *ngIf="harmonyColors().length > 0">
            <div 
              *ngFor="let color of harmonyColors()" 
              class="harmony-color"
              [style.background-color]="color"
              (click)="selectColor(color)"
            >
              <span class="harmony-hex">{{ color }}</span>
            </div>
          </div>
        </div>
        
        <div class="color-contrast">
          <h3>Contrast Checker</h3>
          <div class="contrast-container">
            <div class="contrast-inputs">
              <div class="contrast-input">
                <label>Foreground Color</label>
                <input 
                  type="color" 
                  [(ngModel)]="foregroundColor" 
                  (input)="calculateContrast()"
                  class="color-input"
                >
                <span class="color-value">{{ foregroundColor }}</span>
              </div>
              <div class="contrast-input">
                <label>Background Color</label>
                <input 
                  type="color" 
                  [(ngModel)]="backgroundColor" 
                  (input)="calculateContrast()"
                  class="color-input"
                >
                <span class="color-value">{{ backgroundColor }}</span>
              </div>
            </div>
            <div class="contrast-preview" [style.background-color]="backgroundColor">
              <div class="contrast-text" [style.color]="foregroundColor">
                Sample Text
              </div>
            </div>
            <div class="contrast-results" *ngIf="contrastRatio()">
              <div class="contrast-ratio">
                <span class="ratio-label">Contrast Ratio:</span>
                <span class="ratio-value">{{ contrastRatio()?.toFixed(2) }}:1</span>
              </div>
              <div class="contrast-rating" [class]="getContrastRating()">
                {{ getContrastRating() }}
              </div>
            </div>
          </div>
        </div>
        
        <div class="color-history">
          <h3>Recent Colors</h3>
          <div class="history-colors" *ngIf="colorHistory().length > 0">
            <div 
              *ngFor="let color of colorHistory()" 
              class="history-color"
              [style.background-color]="color"
              (click)="selectColor(color)"
            >
              <span class="history-hex">{{ color }}</span>
            </div>
          </div>
          <button (click)="clearHistory()" class="clear-history-button" *ngIf="colorHistory().length > 0">
            Clear History
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .color-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    
    .color-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    
    .color-header h1 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 2rem;
    }
    
    .color-header p {
      margin: 0;
      color: #666;
    }
    
    .color-content {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
    
    .color-picker-section, .color-formats, .color-palette, .color-harmony, .color-contrast, .color-history {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 1.5rem;
      border: 1px solid #e0e0e0;
    }
    
    .color-picker-section h3, .color-formats h3, .color-palette h3, .color-harmony h3, .color-contrast h3, .color-history h3 {
      margin: 0 0 1rem 0;
      color: #333;
      font-size: 1.2rem;
    }
    
    .picker-container {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .color-picker {
      width: 80px;
      height: 80px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      outline: none;
    }
    
    .color-preview {
      flex: 1;
      height: 80px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #e0e0e0;
    }
    
    .color-text {
      font-family: 'Courier New', monospace;
      font-weight: 600;
      color: white;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
      font-size: 1.1rem;
    }
    
    .formats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }
    
    .format-item {
      background: white;
      border-radius: 8px;
      padding: 1rem;
      border: 1px solid #e0e0e0;
    }
    
    .format-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }
    
    .format-name {
      font-weight: 600;
      color: #333;
    }
    
    .copy-button {
      padding: 0.25rem 0.5rem;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8rem;
    }
    
    .copy-button:hover {
      background: #5a6fd8;
    }
    
    .format-value {
      font-family: 'Courier New', monospace;
      font-weight: 600;
      color: #333;
      margin-bottom: 0.25rem;
      word-break: break-all;
    }
    
    .format-description {
      font-size: 0.8rem;
      color: #666;
    }
    
    .palette-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1rem;
    }
    
    .palette-color {
      aspect-ratio: 1;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.3s ease;
      border: 2px solid transparent;
    }
    
    .palette-color:hover {
      transform: scale(1.05);
    }
    
    .palette-color.selected {
      border-color: #333;
      transform: scale(1.1);
    }
    
    .color-name {
      font-size: 0.8rem;
      font-weight: 600;
      color: white;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
      margin-bottom: 0.25rem;
    }
    
    .color-hex, .harmony-hex, .history-hex {
      font-family: 'Courier New', monospace;
      font-size: 0.7rem;
      color: white;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    }
    
    .harmony-options {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    
    .harmony-button {
      padding: 0.5rem 1rem;
      background: #f8f9fa;
      border: 1px solid #e0e0e0;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .harmony-button:hover {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }
    
    .harmony-colors {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
    
    .harmony-color {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.3s ease;
      border: 2px solid #e0e0e0;
    }
    
    .harmony-color:hover {
      transform: scale(1.1);
    }
    
    .contrast-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .contrast-inputs {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }
    
    .contrast-input {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .contrast-input label {
      font-weight: 600;
      color: #333;
    }
    
    .color-input {
      width: 60px;
      height: 40px;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      cursor: pointer;
    }
    
    .color-value {
      font-family: 'Courier New', monospace;
      font-weight: 600;
      color: #333;
    }
    
    .contrast-preview {
      padding: 2rem;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
      text-align: center;
    }
    
    .contrast-text {
      font-size: 1.5rem;
      font-weight: 600;
    }
    
    .contrast-results {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: white;
      padding: 1rem;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
    }
    
    .contrast-ratio {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    
    .ratio-label {
      font-size: 0.9rem;
      color: #666;
    }
    
    .ratio-value {
      font-family: 'Courier New', monospace;
      font-weight: 600;
      font-size: 1.2rem;
      color: #333;
    }
    
    .contrast-rating {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.9rem;
    }
    
    .contrast-rating.aaa {
      background: #4CAF50;
      color: white;
    }
    
    .contrast-rating.aa {
      background: #8BC34A;
      color: white;
    }
    
    .contrast-rating.aa-large {
      background: #FFC107;
      color: #333;
    }
    
    .contrast-rating.fail {
      background: #f44336;
      color: white;
    }
    
    .history-colors {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 1rem;
    }
    
    .history-color {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.3s ease;
      border: 2px solid #e0e0e0;
    }
    
    .history-color:hover {
      transform: scale(1.1);
    }
    
    .clear-history-button {
      padding: 0.5rem 1rem;
      background: #f44336;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }
    
    .clear-history-button:hover {
      background: #d32f2f;
    }
    
    @media (max-width: 768px) {
      .color-container {
        padding: 1rem;
      }
      
      .picker-container {
        flex-direction: column;
        align-items: stretch;
      }
      
      .color-picker {
        width: 100%;
        height: 60px;
      }
      
      .color-preview {
        height: 60px;
      }
      
      .contrast-inputs {
        grid-template-columns: 1fr;
      }
      
      .contrast-results {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }
    }
  `]
})
export class ColorPickerComponent {
  selectedColor = '#667eea';
  foregroundColor = '#000000';
  backgroundColor = '#ffffff';
  colorFormats = signal<ColorFormat[]>([]);
  harmonyColors = signal<string[]>([]);
  contrastRatio = signal<number | null>(null);
  colorHistory = signal<string[]>([]);

  colorPalette = [
    { name: 'Red', hex: '#f44336' },
    { name: 'Pink', hex: '#e91e63' },
    { name: 'Purple', hex: '#9c27b0' },
    { name: 'Deep Purple', hex: '#673ab7' },
    { name: 'Indigo', hex: '#3f51b5' },
    { name: 'Blue', hex: '#2196f3' },
    { name: 'Light Blue', hex: '#03a9f4' },
    { name: 'Cyan', hex: '#00bcd4' },
    { name: 'Teal', hex: '#009688' },
    { name: 'Green', hex: '#4caf50' },
    { name: 'Light Green', hex: '#8bc34a' },
    { name: 'Lime', hex: '#cddc39' },
    { name: 'Yellow', hex: '#ffeb3b' },
    { name: 'Amber', hex: '#ffc107' },
    { name: 'Orange', hex: '#ff9800' },
    { name: 'Deep Orange', hex: '#ff5722' },
    { name: 'Brown', hex: '#795548' },
    { name: 'Grey', hex: '#9e9e9e' },
    { name: 'Blue Grey', hex: '#607d8b' },
    { name: 'Black', hex: '#000000' }
  ];

  harmonyTypes = [
    { name: 'Complementary', type: 'complementary' },
    { name: 'Triadic', type: 'triadic' },
    { name: 'Analogous', type: 'analogous' },
    { name: 'Split Complementary', type: 'split-complementary' },
    { name: 'Tetradic', type: 'tetradic' }
  ];

  ngOnInit() {
    this.onColorChange();
    this.calculateContrast();
    this.loadHistory();
  }

  onColorChange() {
    this.updateColorFormats();
    this.addToHistory(this.selectedColor);
  }

  selectColor(color: string) {
    this.selectedColor = color;
    this.onColorChange();
  }

  updateColorFormats() {
    const hex = this.selectedColor;
    const rgb = this.hexToRgb(hex);
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    this.colorFormats.set([
      {
        name: 'HEX',
        value: hex.toUpperCase(),
        description: 'Hexadecimal color code'
      },
      {
        name: 'RGB',
        value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
        description: 'Red, Green, Blue values'
      },
      {
        name: 'HSL',
        value: `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`,
        description: 'Hue, Saturation, Lightness'
      },
      {
        name: 'HSB',
        value: this.rgbToHsb(rgb.r, rgb.g, rgb.b),
        description: 'Hue, Saturation, Brightness'
      },
      {
        name: 'CMYK',
        value: this.rgbToCmyk(rgb.r, rgb.g, rgb.b),
        description: 'Cyan, Magenta, Yellow, Key'
      }
    ]);
  }

  generateHarmony(type: string) {
    const hex = this.selectedColor;
    const hsl = this.hexToHsl(hex);
    let colors: string[] = [];

    switch (type) {
      case 'complementary':
        colors = [hex, this.hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l)];
        break;
      case 'triadic':
        colors = [
          hex,
          this.hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
          this.hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l)
        ];
        break;
      case 'analogous':
        colors = [
          this.hslToHex((hsl.h - 30) % 360, hsl.s, hsl.l),
          hex,
          this.hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l)
        ];
        break;
      case 'split-complementary':
        colors = [
          hex,
          this.hslToHex((hsl.h + 150) % 360, hsl.s, hsl.l),
          this.hslToHex((hsl.h + 210) % 360, hsl.s, hsl.l)
        ];
        break;
      case 'tetradic':
        colors = [
          hex,
          this.hslToHex((hsl.h + 90) % 360, hsl.s, hsl.l),
          this.hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l),
          this.hslToHex((hsl.h + 270) % 360, hsl.s, hsl.l)
        ];
        break;
    }

    this.harmonyColors.set(colors);
  }

  calculateContrast() {
    const fgRgb = this.hexToRgb(this.foregroundColor);
    const bgRgb = this.hexToRgb(this.backgroundColor);
    
    const fgLuminance = this.getLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
    const bgLuminance = this.getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
    
    const ratio = (Math.max(fgLuminance, bgLuminance) + 0.05) / (Math.min(fgLuminance, bgLuminance) + 0.05);
    this.contrastRatio.set(ratio);
  }

  getContrastRating(): string {
    const ratio = this.contrastRatio();
    if (!ratio) return 'Unknown';
    
    if (ratio >= 7) return 'AAA';
    if (ratio >= 4.5) return 'AA';
    if (ratio >= 3) return 'AA Large';
    return 'Fail';
  }

  async copyFormat(format: ColorFormat) {
    try {
      await navigator.clipboard.writeText(format.value);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  }

  addToHistory(color: string) {
    if (!this.colorHistory().includes(color)) {
      this.colorHistory.update(history => [color, ...history.slice(0, 19)]);
      this.saveHistory();
    }
  }

  clearHistory() {
    this.colorHistory.set([]);
    this.saveHistory();
  }

  private saveHistory() {
    localStorage.setItem('colorHistory', JSON.stringify(this.colorHistory()));
  }

  private loadHistory() {
    const saved = localStorage.getItem('colorHistory');
    if (saved) {
      try {
        this.colorHistory.set(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load color history:', error);
      }
    }
  }

  // Color conversion utilities
  private hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  private rgbToHsl(r: number, g: number, b: number) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  private hexToHsl(hex: string) {
    const rgb = this.hexToRgb(hex);
    return this.rgbToHsl(rgb.r, rgb.g, rgb.b);
  }

  private hslToHex(h: number, s: number, l: number) {
    h /= 360;
    s /= 100;
    l /= 100;
    
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return `#${Math.round(r * 255).toString(16).padStart(2, '0')}${Math.round(g * 255).toString(16).padStart(2, '0')}${Math.round(b * 255).toString(16).padStart(2, '0')}`;
  }

  private rgbToHsb(r: number, g: number, b: number) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    
    let h = 0;
    if (diff !== 0) {
      if (max === r) h = ((g - b) / diff) % 6;
      else if (max === g) h = (b - r) / diff + 2;
      else h = (r - g) / diff + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
    
    const s = max === 0 ? 0 : Math.round((diff / max) * 100);
    const bVal = Math.round(max * 100);
    
    return `hsb(${h}, ${s}%, ${bVal}%)`;
  }

  private rgbToCmyk(r: number, g: number, b: number) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const k = 1 - Math.max(r, g, b);
    const c = k === 1 ? 0 : (1 - r - k) / (1 - k);
    const m = k === 1 ? 0 : (1 - g - k) / (1 - k);
    const y = k === 1 ? 0 : (1 - b - k) / (1 - k);
    
    return `cmyk(${Math.round(c * 100)}%, ${Math.round(m * 100)}%, ${Math.round(y * 100)}%, ${Math.round(k * 100)}%)`;
  }

  private getLuminance(r: number, g: number, b: number) {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }
}
