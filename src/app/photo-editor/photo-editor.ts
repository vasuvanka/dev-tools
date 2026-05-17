import { Component, ElementRef, ViewChild, AfterViewInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface PlacedText {
  text: string;
  x: number;
  y: number;
  size: number;
  color: string;
  font: string;
}

@Component({
  selector: 'app-photo-editor',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tool-container">
      <div class="glass-section header-section">
        <h2>🖼️ Photo Editor</h2>
        <p>Edit, crop, add text, and apply filters to your images.</p>
      </div>

      <div class="editor-layout">
        <div class="controls-section glass-card">
          
          <div class="upload-btn-wrapper">
            <button class="btn-primary">Upload Image</button>
            <input type="file" accept="image/*" (change)="onFileSelected($event)" />
          </div>

          <div class="tool-modes" *ngIf="hasImage()">
            <button class="btn-secondary" [class.active-mode]="currentMode() === 'none'" (click)="setMode('none')">Filters</button>
            <button class="btn-secondary" [class.active-mode]="currentMode() === 'crop'" (click)="setMode('crop')">Crop</button>
            <button class="btn-secondary" [class.active-mode]="currentMode() === 'text'" (click)="setMode('text')">Text</button>
          </div>

          <div class="sliders" *ngIf="hasImage() && currentMode() === 'none'">
            <div class="control-group">
              <label>Brightness ({{brightness()}}%)</label>
              <input type="range" min="0" max="200" [value]="brightness()" (input)="updateFilter('brightness', $event)">
            </div>
            <div class="control-group">
              <label>Contrast ({{contrast()}}%)</label>
              <input type="range" min="0" max="200" [value]="contrast()" (input)="updateFilter('contrast', $event)">
            </div>
            <div class="control-group">
              <label>Saturation ({{saturation()}}%)</label>
              <input type="range" min="0" max="200" [value]="saturation()" (input)="updateFilter('saturation', $event)">
            </div>
            <div class="control-group">
              <label>Blur ({{blur()}}px)</label>
              <input type="range" min="0" max="10" [value]="blur()" (input)="updateFilter('blur', $event)">
            </div>
            <div class="action-buttons">
              <button class="btn-secondary" (click)="rotate()">Rotate 90°</button>
            </div>
          </div>

          <div class="crop-controls" *ngIf="hasImage() && currentMode() === 'crop'">
            <p class="instruction-text">Click and drag on the image to draw a crop rectangle.</p>
            <button class="btn-primary" (click)="applyCrop()" [disabled]="!hasCropSelection()">Apply Crop</button>
            <button class="btn-secondary" (click)="clearCrop()">Clear Selection</button>
          </div>

          <div class="text-controls" *ngIf="hasImage() && currentMode() === 'text'">
            <p class="instruction-text">Configure text below, then click anywhere on the image to place it.</p>
            <div class="control-group">
              <label>Text content</label>
              <input type="text" [value]="textContent()" (input)="updateTextSetting('content', $event)" placeholder="Enter text here...">
            </div>
            <div class="control-group">
              <label>Size ({{textSize()}}px)</label>
              <input type="range" min="10" max="150" [value]="textSize()" (input)="updateTextSetting('size', $event)">
            </div>
            <div class="control-group">
              <label>Color</label>
              <input type="color" [value]="textColor()" (input)="updateTextSetting('color', $event)">
            </div>
            <div class="control-group">
              <label>Font</label>
              <select [value]="textFont()" (change)="updateTextSetting('font', $event)">
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
                <option value="Impact">Impact</option>
                <option value="Comic Sans MS">Comic Sans MS</option>
              </select>
            </div>
            <button class="btn-secondary" (click)="clearTexts()">Clear All Text</button>
          </div>

          <div class="action-buttons" *ngIf="hasImage()" style="margin-top: 2rem;">
            <button class="btn-primary" (click)="download()">Download Final Image</button>
          </div>
        </div>

        <div class="preview-section glass-card">
          <div class="canvas-container">
            <canvas #canvas 
              (mousedown)="onMouseDown($event)"
              (mousemove)="onMouseMove($event)"
              (mouseup)="onMouseUp($event)"
              (mouseleave)="onMouseUp($event)"
              [style.cursor]="getCursor()"></canvas>
            <div *ngIf="!hasImage()" class="placeholder-text">
              No image selected. Upload an image to start editing.
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
    }
    .header-section {
      text-align: center;
      padding: 2rem;
      margin-bottom: 2rem;
      border-radius: 16px;
    }
    .header-section h2 { margin-bottom: 0.5rem; color: var(--text-primary); }
    .header-section p { color: var(--text-secondary); margin: 0; }
    
    .editor-layout {
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 2rem;
    }
    
    @media (max-width: 768px) {
      .editor-layout { grid-template-columns: 1fr; }
    }
    
    .controls-section {
      padding: 1.5rem;
      border-radius: 16px;
      background: var(--glass-bg-light);
    }
    
    .tool-modes {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }
    .tool-modes button {
      flex: 1;
      padding: 0.5rem;
      font-size: 0.9rem;
    }
    .active-mode {
      background: var(--accent-pink) !important;
      color: white !important;
      border-color: var(--accent-pink) !important;
    }

    .instruction-text {
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin-bottom: 1rem;
      font-style: italic;
    }
    
    .preview-section {
      padding: 1.5rem;
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      background: var(--glass-bg-medium);
      overflow: auto;
    }
    
    .canvas-container {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    canvas {
      max-width: 100%;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    .placeholder-text {
      position: absolute;
      color: var(--text-secondary);
      text-align: center;
    }
    
    .upload-btn-wrapper {
      position: relative;
      overflow: hidden;
      display: inline-block;
      width: 100%;
      margin-bottom: 1.5rem;
    }
    
    .upload-btn-wrapper input[type=file] {
      font-size: 100px;
      position: absolute;
      left: 0;
      top: 0;
      opacity: 0;
      cursor: pointer;
    }
    
    .btn-primary, .btn-secondary {
      width: 100%;
      padding: 0.75rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.2s ease;
      margin-bottom: 0.5rem;
    }
    .btn-primary {
      background: var(--accent-pink);
      color: white;
    }
    .btn-primary:hover:not(:disabled) { opacity: 0.9; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    
    .btn-secondary {
      background: var(--glass-bg-medium);
      color: var(--text-primary);
      border: 1px solid var(--glass-border-light);
    }
    .btn-secondary:hover:not(.active-mode) { background: var(--glass-bg-heavy); }
    
    .control-group {
      margin-bottom: 1.25rem;
    }
    .control-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
      color: var(--text-primary);
    }
    .control-group input[type=range], .control-group input[type=text], .control-group select {
      width: 100%;
      accent-color: var(--accent-pink);
    }
    .control-group input[type=text], .control-group select {
      padding: 0.5rem;
      border-radius: 6px;
      border: 1px solid var(--glass-border-light);
      background: var(--glass-bg-medium);
      color: var(--text-primary);
    }
    .control-group input[type=color] {
      width: 100%;
      height: 40px;
      border-radius: 6px;
      cursor: pointer;
      border: 1px solid var(--glass-border-light);
      padding: 0;
    }
  `]
})
export class PhotoEditor implements AfterViewInit {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  hasImage = signal(false);
  currentMode = signal<'none' | 'crop' | 'text'>('none');
  
  // Filters
  brightness = signal(100);
  contrast = signal(100);
  saturation = signal(100);
  blur = signal(0);
  private rotation = 0;

  // Text state
  textContent = signal('Hello World');
  textSize = signal(40);
  textColor = signal('#ffffff');
  textFont = signal('Arial');
  private placedTexts: PlacedText[] = [];

  // Crop state
  private isDragging = false;
  private cropStart = { x: 0, y: 0 };
  private cropCurrent = { x: 0, y: 0 };
  hasCropSelection = signal(false);
  
  private ctx!: CanvasRenderingContext2D;
  private image = new Image();

  ngAfterViewInit() {
    // Canvas initialized later
  }

  setMode(mode: 'none' | 'crop' | 'text') {
    this.currentMode.set(mode);
    if (mode !== 'crop') {
      this.clearCrop();
    }
  }

  getCursor() {
    if (this.currentMode() === 'crop') return 'crosshair';
    if (this.currentMode() === 'text') return 'text';
    return 'default';
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      this.image.src = url;
      this.image.onload = () => {
        this.hasImage.set(true);
        this.resetFilters();
        this.clearTexts();
        this.clearCrop();
        this.drawImage();
      };
    }
  }

  updateFilter(filter: 'brightness' | 'contrast' | 'saturation' | 'blur', event: Event) {
    const value = +(event.target as HTMLInputElement).value;
    switch(filter) {
      case 'brightness': this.brightness.set(value); break;
      case 'contrast': this.contrast.set(value); break;
      case 'saturation': this.saturation.set(value); break;
      case 'blur': this.blur.set(value); break;
    }
    this.drawImage();
  }

  updateTextSetting(setting: 'content' | 'size' | 'color' | 'font', event: Event) {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    if (setting === 'content') this.textContent.set(target.value);
    if (setting === 'size') this.textSize.set(+target.value);
    if (setting === 'color') this.textColor.set(target.value);
    if (setting === 'font') this.textFont.set(target.value);
  }

  rotate() {
    this.rotation = (this.rotation + 90) % 360;
    this.drawImage();
  }

  resetFilters() {
    this.brightness.set(100);
    this.contrast.set(100);
    this.saturation.set(100);
    this.blur.set(0);
    this.rotation = 0;
  }

  clearTexts() {
    this.placedTexts = [];
    this.drawImage();
  }

  // --- MOUSE EVENTS FOR CROP / TEXT ---
  
  private getMousePos(evt: MouseEvent) {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const scaleX = this.canvasRef.nativeElement.width / rect.width;
    const scaleY = this.canvasRef.nativeElement.height / rect.height;
    return {
      x: (evt.clientX - rect.left) * scaleX,
      y: (evt.clientY - rect.top) * scaleY
    };
  }

  onMouseDown(event: MouseEvent) {
    if (!this.hasImage()) return;
    const pos = this.getMousePos(event);

    if (this.currentMode() === 'crop') {
      this.isDragging = true;
      this.cropStart = pos;
      this.cropCurrent = pos;
      this.hasCropSelection.set(false);
    } else if (this.currentMode() === 'text') {
      if (this.textContent().trim().length === 0) return;
      this.placedTexts.push({
        text: this.textContent(),
        x: pos.x,
        y: pos.y,
        size: this.textSize(),
        color: this.textColor(),
        font: this.textFont()
      });
      this.drawImage();
    }
  }

  onMouseMove(event: MouseEvent) {
    if (!this.isDragging || this.currentMode() !== 'crop') return;
    this.cropCurrent = this.getMousePos(event);
    this.drawImage(); // Redraws image + crop overlay
  }

  onMouseUp(event: MouseEvent) {
    if (this.isDragging && this.currentMode() === 'crop') {
      this.isDragging = false;
      const width = Math.abs(this.cropCurrent.x - this.cropStart.x);
      const height = Math.abs(this.cropCurrent.y - this.cropStart.y);
      if (width > 10 && height > 10) {
        this.hasCropSelection.set(true);
      } else {
        this.clearCrop();
      }
    }
  }

  clearCrop() {
    this.hasCropSelection.set(false);
    this.cropStart = {x:0,y:0};
    this.cropCurrent = {x:0,y:0};
    this.drawImage();
  }

  applyCrop() {
    if (!this.hasCropSelection() || !this.canvasRef) return;
    
    // We want to bake the crop. To do this, we bake the current canvas state into a new image.
    // This bakes filters, rotation, and texts!
    const canvas = this.canvasRef.nativeElement;
    
    const minX = Math.min(this.cropStart.x, this.cropCurrent.x);
    const minY = Math.min(this.cropStart.y, this.cropCurrent.y);
    const width = Math.abs(this.cropCurrent.x - this.cropStart.x);
    const height = Math.abs(this.cropCurrent.y - this.cropStart.y);

    const croppedDataUrl = this.cropCanvas(canvas, minX, minY, width, height);
    
    // Load new image
    const newImg = new Image();
    newImg.src = croppedDataUrl;
    newImg.onload = () => {
      this.image = newImg;
      this.resetFilters();
      this.clearTexts();
      this.setMode('none');
      this.drawImage();
    };
  }

  private cropCanvas(sourceCanvas: HTMLCanvasElement, x: number, y: number, w: number, h: number): string {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = w;
    tempCanvas.height = h;
    const tCtx = tempCanvas.getContext('2d')!;
    tCtx.drawImage(sourceCanvas, x, y, w, h, 0, 0, w, h);
    return tempCanvas.toDataURL('image/png');
  }

  // --- RENDER PIPELINE ---

  private drawImage() {
    if (!this.hasImage() || !this.canvasRef) return;
    
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    this.ctx = ctx;

    if (this.rotation === 90 || this.rotation === 270) {
      canvas.width = this.image.height;
      canvas.height = this.image.width;
    } else {
      canvas.width = this.image.width;
      canvas.height = this.image.height;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 1. Draw Image with Filters & Rotation
    ctx.save();
    ctx.filter = `brightness(${this.brightness()}%) contrast(${this.contrast()}%) saturate(${this.saturation()}%) blur(${this.blur()}px)`;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(this.rotation * Math.PI / 180);
    ctx.drawImage(this.image, -this.image.width / 2, -this.image.height / 2);
    ctx.restore(); // Removes filter/rotation for text and overlays

    // 2. Draw Placed Texts
    this.placedTexts.forEach(pt => {
      ctx.fillStyle = pt.color;
      ctx.font = `${pt.size}px ${pt.font}`;
      ctx.textBaseline = 'middle';
      ctx.fillText(pt.text, pt.x, pt.y);
    });

    // 3. Draw Crop Overlay if active
    if (this.currentMode() === 'crop' && (this.isDragging || this.hasCropSelection())) {
      const minX = Math.min(this.cropStart.x, this.cropCurrent.x);
      const minY = Math.min(this.cropStart.y, this.cropCurrent.y);
      const width = Math.abs(this.cropCurrent.x - this.cropStart.x);
      const height = Math.abs(this.cropCurrent.y - this.cropStart.y);

      // Darken outside
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, minY); // top
      ctx.fillRect(0, minY, minX, height); // left
      ctx.fillRect(minX + width, minY, canvas.width - (minX + width), height); // right
      ctx.fillRect(0, minY + height, canvas.width, canvas.height - (minY + height)); // bottom

      // Draw dashed border
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(minX, minY, width, height);
      ctx.setLineDash([]); // reset
    }
  }

  download() {
    const canvas = this.canvasRef.nativeElement;
    const link = document.createElement('a');
    link.download = 'edited-photo.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
}
