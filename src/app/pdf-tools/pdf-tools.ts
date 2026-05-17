import { Component, ElementRef, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PDFDocument, rgb, LineCapStyle } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.mjs`;

type Tool = 'select' | 'eraser' | 'text' | 'draw' | 'form';

interface PdfElement {
  id: string;
  page: number;
  type: 'whiteout' | 'text' | 'path' | 'form';
  x: number;
  y: number;

  width?: number;
  height?: number;

  text?: string;
  size?: number;
  color?: string;

  points?: { x: number, y: number }[];
  thickness?: number;

  icon?: string;
}

@Component({
  selector: 'app-pdf-tools',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-container">
      <div class="glass-section header-section">
        <h2>📑 PDF Editor</h2>
        <p>Advanced overlay editor with dragging, drawing, and form filling.</p>
      </div>

      <div class="pdf-layout">
        <div class="controls-section glass-card">
          <h3>Tools</h3>
          
          <div class="upload-btn-wrapper">
            <button class="btn-primary">Upload PDF</button>
            <input type="file" accept="application/pdf" (change)="onFileSelected($event)" />
          </div>

          <div class="actions" *ngIf="pdfDoc()">
            
            <div class="pagination-controls">
              <button class="btn-icon" (click)="prevPage()" [disabled]="currentPage() <= 1">◀</button>
              <span>Page {{ currentPage() }} of {{ totalPages() }}</span>
              <button class="btn-icon" (click)="nextPage()" [disabled]="currentPage() >= totalPages()">▶</button>
            </div>

            <div class="mode-toggle-grid">
              <button [class.active]="currentTool() === 'select'" (click)="setTool('select')" title="Select & Drag">
                🖱️ Select
              </button>
              <button [class.active]="currentTool() === 'eraser'" (click)="setTool('eraser')" title="Whiteout">
                🧽 Whiteout
              </button>
              <button [class.active]="currentTool() === 'text'" (click)="setTool('text')" title="Add Text">
                ✍️ Text
              </button>
              <button [class.active]="currentTool() === 'draw'" (click)="setTool('draw')" title="Freehand Draw">
                🖊️ Draw
              </button>
              <button [class.active]="currentTool() === 'form'" (click)="setTool('form')" title="Form Checkmarks">
                ☑️ Form
              </button>
            </div>
            
            <!-- Context Menus -->
            <div class="context-menu" *ngIf="currentTool() === 'text'">
              <input type="text" [ngModel]="activeText()" (ngModelChange)="activeText.set($event)" placeholder="Type text here..." />
              <input type="range" min="10" max="72" [ngModel]="textSize()" (ngModelChange)="textSize.set($event)" />
            </div>

            <div class="context-menu" *ngIf="currentTool() === 'draw'">
              <label>Thickness</label>
              <input type="range" min="1" max="10" [ngModel]="drawThickness()" (ngModelChange)="drawThickness.set($event)" />
            </div>

            <div class="context-menu" *ngIf="currentTool() === 'form'">
              <div class="form-icons">
                <button [class.active]="formIcon() === '✔'" (click)="formIcon.set('✔')">✔ Check</button>
                <button [class.active]="formIcon() === '❌'" (click)="formIcon.set('❌')">❌ Cross</button>
              </div>
            </div>

            <div class="context-menu" *ngIf="currentTool() === 'select'">
              <p class="helper-text">Click and drag elements to move them. Select an element and press Delete/Backspace to remove it.</p>
              <button class="btn-secondary" style="margin-top:0.5rem;" *ngIf="selectedElementId()" (click)="deleteSelected()">Delete Selected</button>
            </div>

            <hr class="divider"/>
            <button class="btn-secondary" (click)="clearEditsOnPage()">Clear Page Edits</button>
            
            <div *ngIf="processing()" class="loading-text">Generating Final PDF...</div>
            <button class="btn-primary" style="margin-top: 1rem;" (click)="downloadModifiedPdf()">Download Edited PDF</button>
          </div>
        </div>

        <div class="preview-section glass-card" #canvasContainer>
          <div *ngIf="!pdfDoc()" class="placeholder-text">
            No PDF selected. Upload a document to start editing.
          </div>
          
          <div class="canvas-wrapper" *ngIf="pdfDoc()">
            <canvas #pdfCanvas></canvas>
            <canvas #overlayCanvas 
                class="overlay-canvas"
                [style.cursor]="getCursor()"
                tabindex="0"
                (keydown)="onKeyDown($event)"
                (mousedown)="onMouseDown($event)"
                (mousemove)="onMouseMove($event)"
                (mouseup)="onMouseUp($event)"
                (mouseleave)="onMouseUp($event)"></canvas>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-container { max-width: 1400px; margin: 0 auto; height: 100%; }
    .header-section { text-align: center; padding: 2rem; margin-bottom: 2rem; border-radius: 16px; }
    .header-section h2 { margin-bottom: 0.5rem; color: var(--text-primary); }
    .header-section p { color: var(--text-secondary); margin: 0; }
    
    .pdf-layout { display: grid; grid-template-columns: 350px 1fr; gap: 2rem; min-height: 800px; }
    @media (max-width: 900px) { .pdf-layout { grid-template-columns: 1fr; } }
    
    .controls-section { padding: 1.5rem; border-radius: 16px; display: flex; flex-direction: column; gap: 1rem;}
    .preview-section { 
      padding: 1.5rem; border-radius: 16px; display: flex; flex-direction: column; 
      align-items: center; justify-content: flex-start; background: var(--glass-bg-light); 
      min-height: 600px; overflow-y: auto; overflow-x: auto;
    }
    
    .placeholder-text { color: var(--text-secondary); margin-top: 2rem;}
    
    .canvas-wrapper { position: relative; box-shadow: 0 4px 15px rgba(0,0,0,0.3); }
    canvas { display: block; }
    .overlay-canvas { position: absolute; top: 0; left: 0; z-index: 10; outline: none; }
    
    .upload-btn-wrapper { position: relative; overflow: hidden; display: inline-block; width: 100%; }
    .upload-btn-wrapper input[type=file] { font-size: 100px; position: absolute; left: 0; top: 0; opacity: 0; cursor: pointer; height: 100%; width: 100%; }
    
    .btn-primary, .btn-secondary { width: 100%; padding: 0.75rem; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s ease; margin-bottom: 0.5rem; }
    .btn-primary { background: var(--accent-pink); color: white; }
    .btn-primary:hover { opacity: 0.9; }
    .btn-secondary { background: var(--glass-bg-medium); color: var(--text-primary); border: 1px solid var(--glass-border-light); }
    .btn-secondary:hover { background: var(--glass-bg-heavy); }
    
    .pagination-controls { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; background: var(--glass-bg-medium); padding: 0.5rem; border-radius: 8px;}
    .btn-icon { background: transparent; border: none; color: var(--text-primary); cursor: pointer; font-size: 1.2rem; padding: 0 0.5rem;}
    .btn-icon:disabled { opacity: 0.3; cursor: not-allowed; }
    
    .mode-toggle-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 1rem; }
    .mode-toggle-grid button { padding: 0.5rem; border: none; background: var(--glass-bg-medium); color: var(--text-secondary); border-radius: 6px; cursor: pointer; font-weight: 600; transition: all 0.2s; font-size: 0.9rem;}
    .mode-toggle-grid button.active { background: var(--accent-pink); color: white; }
    
    .context-menu { background: var(--glass-bg-medium); padding: 1rem; border-radius: 8px; margin-bottom: 1rem; }
    .context-menu input[type=text] { width: 100%; padding: 0.75rem; border-radius: 8px; border: 1px solid var(--glass-border-light); background: var(--glass-bg-light); color: var(--text-primary); margin-bottom: 0.5rem; }
    .context-menu input[type=range] { width: 100%; accent-color: var(--accent-pink); }
    .context-menu label { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.25rem; display: block;}
    
    .form-icons { display: flex; gap: 0.5rem; }
    .form-icons button { flex: 1; padding: 0.5rem; border-radius: 6px; border: 1px solid var(--glass-border-light); background: transparent; color: var(--text-primary); cursor: pointer;}
    .form-icons button.active { background: rgba(236, 72, 153, 0.2); border-color: var(--accent-pink);}
    
    .helper-text { font-size: 0.85rem; color: var(--text-secondary); margin: 0; line-height: 1.4;}
    .divider { border: 0; border-top: 1px solid var(--glass-border-light); margin: 1rem 0; }
    .loading-text { color: var(--accent-pink); font-size: 0.9rem; font-weight: 600; text-align: center; margin-top: 1rem; }
  `]
})
export class PdfTools {
  @ViewChild('pdfCanvas') pdfCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('overlayCanvas') overlayCanvas!: ElementRef<HTMLCanvasElement>;

  pdfDoc = signal<pdfjsLib.PDFDocumentProxy | null>(null);
  originalPdfBytes = signal<Uint8Array | null>(null);

  currentPage = signal<number>(1);
  totalPages = signal<number>(0);

  currentTool = signal<Tool>('select');

  // Tool state
  activeText = signal('New Text');
  textSize = signal(16);
  drawThickness = signal(3);
  formIcon = signal<'✔' | '❌'>('✔');

  processing = signal(false);

  // Storage for edits
  elements = signal<PdfElement[]>([]);
  selectedElementId = signal<string | null>(null);

  // Interaction state
  private isDrawing = false;
  private isDragging = false;
  private startX = 0;
  private startY = 0;
  private currentX = 0;
  private currentY = 0;
  private dragOffsetX = 0;
  private dragOffsetY = 0;
  private currentPath: { x: number, y: number }[] = [];

  private currentRenderTask: pdfjsLib.RenderTask | null = null;
  private scale = 1.5;

  async onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        this.originalPdfBytes.set(new Uint8Array(arrayBuffer));

        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const doc = await loadingTask.promise;
        this.pdfDoc.set(doc);
        this.totalPages.set(doc.numPages);
        this.currentPage.set(1);

        this.elements.set([]);
        this.selectedElementId.set(null);
        setTimeout(() => this.renderPage(1), 0);
      } catch (err) {
        console.error("Error loading PDF", err);
      }
    }
  }

  getCursor(): string {
    switch (this.currentTool()) {
      case 'select': return 'default';
      case 'eraser': return 'crosshair';
      case 'text': return 'text';
      case 'draw': return 'crosshair';
      case 'form': return 'pointer';
      default: return 'default';
    }
  }

  setTool(tool: Tool) {
    this.currentTool.set(tool);
    if (tool !== 'select') this.selectedElementId.set(null);
    this.redrawOverlay();
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      this.selectedElementId.set(null);
      this.renderPage(this.currentPage());
    }
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
      this.selectedElementId.set(null);
      this.renderPage(this.currentPage());
    }
  }

  clearEditsOnPage() {
    const p = this.currentPage();
    this.elements.update(arr => arr.filter(e => e.page !== p));
    this.selectedElementId.set(null);
    this.redrawOverlay();
  }

  deleteSelected() {
    const id = this.selectedElementId();
    if (id) {
      this.elements.update(arr => arr.filter(e => e.id !== id));
      this.selectedElementId.set(null);
      this.redrawOverlay();
    }
  }

  onKeyDown(e: KeyboardEvent) {
    if ((e.key === 'Delete' || e.key === 'Backspace') && this.selectedElementId() && this.currentTool() === 'select') {
      this.deleteSelected();
    }
  }

  private async renderPage(pageNum: number) {
    const doc = this.pdfDoc();
    if (!doc) return;

    if (this.currentRenderTask) await this.currentRenderTask.cancel();

    const page = await doc.getPage(pageNum);
    const viewport = page.getViewport({ scale: this.scale });

    const canvas = this.pdfCanvas.nativeElement;
    const ctx = canvas.getContext('2d')!;
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const overlay = this.overlayCanvas.nativeElement;
    overlay.height = viewport.height;
    overlay.width = viewport.width;

    const renderContext: any = { canvasContext: ctx, viewport: viewport };
    this.currentRenderTask = page.render(renderContext);
    await this.currentRenderTask.promise.catch(err => {
      if (err.name !== 'RenderingCancelledException') console.error(err);
    });

    this.redrawOverlay();
  }

  private redrawOverlay() {
    if (!this.overlayCanvas) return;
    const canvas = this.overlayCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const p = this.currentPage();
    const elems = this.elements().filter(e => e.page === p);

    elems.forEach(el => {
      ctx.save();

      // Highlight selected
      if (el.id === this.selectedElementId() && this.currentTool() === 'select') {
        ctx.shadowColor = 'rgba(236, 72, 153, 0.8)';
        ctx.shadowBlur = 10;
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 2;

        // Draw selection box based on type
        if (el.type === 'whiteout') {
          ctx.strokeRect(el.x - 2, el.y - 2, el.width! + 4, el.height! + 4);
        } else if (el.type === 'text') {
          ctx.font = `${el.size! * this.scale}px Arial`;
          const w = ctx.measureText(el.text!).width;
          const h = el.size! * this.scale;
          ctx.strokeRect(el.x - 4, el.y - h + 2, w + 8, h + 8);
        } else if (el.type === 'form') {
          ctx.font = `${24 * this.scale}px Arial`;
          const w = ctx.measureText(el.icon!).width;
          const h = 24 * this.scale;
          ctx.strokeRect(el.x - 4, el.y - h + 4, w + 8, h + 8);
        }
        ctx.shadowBlur = 0; // reset
      }

      if (el.type === 'whiteout') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(el.x, el.y, el.width!, el.height!);
      } else if (el.type === 'text') {
        ctx.font = `${el.size! * this.scale}px Arial`;
        ctx.fillStyle = el.color || '#000000';
        ctx.fillText(el.text!, el.x, el.y);
      } else if (el.type === 'form') {
        ctx.font = `${24 * this.scale}px Arial`;
        ctx.fillStyle = el.icon === '❌' ? '#ff4b4b' : '#10b981';
        ctx.fillText(el.icon!, el.x, el.y);
      } else if (el.type === 'path' && el.points) {
        ctx.beginPath();
        ctx.strokeStyle = el.color || '#000000';
        ctx.lineWidth = el.thickness! * this.scale;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        el.points.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.stroke();
      }

      ctx.restore();
    });

    // Draw in-progress whiteout
    if (this.isDrawing && this.currentTool() === 'eraser') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 1;
      const w = this.currentX - this.startX;
      const h = this.currentY - this.startY;
      ctx.fillRect(this.startX, this.startY, w, h);
      ctx.strokeRect(this.startX, this.startY, w, h);
    }

    // Draw in-progress path
    if (this.isDrawing && this.currentTool() === 'draw' && this.currentPath.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = this.drawThickness() * this.scale;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      this.currentPath.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();
    }
  }

  private generateId() { return Math.random().toString(36).substr(2, 9); }

  private getElementAtPos(x: number, y: number): PdfElement | null {
    const p = this.currentPage();
    const elems = this.elements().filter(e => e.page === p);

    // Reverse order to pick top-most element
    for (let i = elems.length - 1; i >= 0; i--) {
      const el = elems[i];
      if (el.type === 'whiteout') {
        if (x >= el.x && x <= el.x + el.width! && y >= el.y && y <= el.y + el.height!) return el;
      } else if (el.type === 'text') {
        // Approximate text bounding box
        const h = el.size! * this.scale;
        const w = h * (el.text!.length * 0.5); // very rough estimate, fine for selection
        if (x >= el.x && x <= el.x + w && y >= el.y - h && y <= el.y) return el;
      } else if (el.type === 'form') {
        const h = 24 * this.scale;
        const w = h;
        if (x >= el.x && x <= el.x + w && y >= el.y - h && y <= el.y) return el;
      }
      // Paths are too hard to click easily, ignore selection for now
    }
    return null;
  }

  onMouseDown(e: MouseEvent) {
    // Focus canvas for keyboard events
    this.overlayCanvas.nativeElement.focus();

    const rect = this.overlayCanvas.nativeElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const tool = this.currentTool();

    if (tool === 'select') {
      const clickedEl = this.getElementAtPos(x, y);
      if (clickedEl) {
        this.selectedElementId.set(clickedEl.id);
        this.isDragging = true;
        this.dragOffsetX = x - clickedEl.x;
        this.dragOffsetY = y - clickedEl.y;
      } else {
        this.selectedElementId.set(null);
      }
      this.redrawOverlay();
      return;
    }

    if (tool === 'text') {
      this.elements.update(arr => [...arr, {
        id: this.generateId(), page: this.currentPage(), type: 'text',
        x, y, text: this.activeText(), size: this.textSize(), color: '#000000'
      }]);
      this.redrawOverlay();
      return;
    }

    if (tool === 'form') {
      this.elements.update(arr => [...arr, {
        id: this.generateId(), page: this.currentPage(), type: 'form',
        x, y, icon: this.formIcon()
      }]);
      this.redrawOverlay();
      return;
    }

    if (tool === 'eraser') {
      this.isDrawing = true;
      this.startX = x; this.startY = y;
      this.currentX = x; this.currentY = y;
    }

    if (tool === 'draw') {
      this.isDrawing = true;
      this.currentPath = [{ x, y }];
    }
  }

  onMouseMove(e: MouseEvent) {
    const rect = this.overlayCanvas.nativeElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (this.currentTool() === 'select' && this.isDragging && this.selectedElementId()) {
      this.elements.update(arr => arr.map(el => {
        if (el.id === this.selectedElementId()) {
          return { ...el, x: x - this.dragOffsetX, y: y - this.dragOffsetY };
        }
        return el;
      }));
      this.redrawOverlay();
      return;
    }

    this.currentX = x;
    this.currentY = y;

    if (this.isDrawing && this.currentTool() === 'draw') {
      this.currentPath.push({ x, y });
      this.redrawOverlay();
    } else if (this.isDrawing && this.currentTool() === 'eraser') {
      this.redrawOverlay();
    }
  }

  onMouseUp(e: MouseEvent) {
    if (this.isDragging) {
      this.isDragging = false;
    }

    if (this.isDrawing && this.currentTool() === 'eraser') {
      this.isDrawing = false;
      const w = this.currentX - this.startX;
      const h = this.currentY - this.startY;
      if (Math.abs(w) > 5 && Math.abs(h) > 5) {
        this.elements.update(arr => [...arr, {
          id: this.generateId(), page: this.currentPage(), type: 'whiteout',
          x: w < 0 ? this.currentX : this.startX,
          y: h < 0 ? this.currentY : this.startY,
          width: Math.abs(w), height: Math.abs(h)
        }]);
      }
      this.redrawOverlay();
    }

    if (this.isDrawing && this.currentTool() === 'draw') {
      this.isDrawing = false;
      if (this.currentPath.length > 1) {
        this.elements.update(arr => [...arr, {
          id: this.generateId(), page: this.currentPage(), type: 'path',
          x: 0, y: 0, points: [...this.currentPath], thickness: this.drawThickness(), color: '#000000'
        }]);
      }
      this.currentPath = [];
      this.redrawOverlay();
    }
  }

  async downloadModifiedPdf() {
    const bytes = this.originalPdfBytes();
    if (!bytes) return;

    this.processing.set(true);

    try {
      const pdfDoc = await PDFDocument.load(bytes);
      const pages = pdfDoc.getPages();

      pages.forEach((page, index) => {
        const pageNum = index + 1;
        const { height } = page.getSize();
        const elems = this.elements().filter(e => e.page === pageNum);

        elems.forEach(el => {
          const pdfX = el.x / this.scale;
          const pdfY = height - (el.y / this.scale);

          if (el.type === 'whiteout') {
            const pdfW = el.width! / this.scale;
            const pdfH = el.height! / this.scale;
            page.drawRectangle({
              x: pdfX, y: pdfY - pdfH, width: pdfW, height: pdfH,
              color: rgb(1, 1, 1), borderColor: rgb(1, 1, 1),
            });
          } else if (el.type === 'text') {
            page.drawText(el.text!, { x: pdfX, y: pdfY, size: el.size, color: rgb(0, 0, 0) });
          } else if (el.type === 'form') {
            const color = el.icon === '❌' ? rgb(1, 0.3, 0.3) : rgb(0.1, 0.7, 0.5);
            page.drawText(el.icon!, { x: pdfX, y: pdfY, size: 24, color: color });
          } else if (el.type === 'path' && el.points) {
            // Draw lines between points
            for (let i = 1; i < el.points.length; i++) {
              const p1 = el.points[i - 1];
              const p2 = el.points[i];
              page.drawLine({
                start: { x: p1.x / this.scale, y: height - (p1.y / this.scale) },
                end: { x: p2.x / this.scale, y: height - (p2.y / this.scale) },
                thickness: el.thickness!,
                color: rgb(0, 0, 0),
                lineCap: LineCapStyle.Round
              });
            }
          }
        });
      });

      const modifiedBytes = await pdfDoc.save();
      const blob = new Blob([modifiedBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'edited-document.pdf';
      link.click();
      URL.revokeObjectURL(url);

    } catch (e) {
      console.error(e);
      alert("Failed to generate PDF.");
    } finally {
      this.processing.set(false);
    }
  }
}
