import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-qr-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="qr-container">
      <div class="qr-header">
        <h1>📱 QR Code Generator</h1>
        <p>Generate QR codes for text, URLs, and more</p>
      </div>
      
      <div class="qr-content">
        <div class="input-section">
          <div class="section-header">
            <h3>Input Data</h3>
            <div class="input-actions">
              <button (click)="clearInput()" class="action-button">
                🗑️ Clear
              </button>
              <button (click)="pasteFromClipboard()" class="action-button">
                📋 Paste
              </button>
            </div>
          </div>
          <textarea 
            [(ngModel)]="inputText" 
            placeholder="Enter text, URL, or any data to generate QR code..."
            class="qr-input"
            (input)="generateQR()"
          ></textarea>
          <div class="input-stats">
            <span>Characters: {{ inputText.length }}</span>
            <span>Type: {{ getInputType() }}</span>
          </div>
        </div>
        
        <div class="qr-options">
          <h3>QR Code Options</h3>
          <div class="options-grid">
            <div class="option-group">
              <label>Size:</label>
              <select [(ngModel)]="qrSize" (change)="generateQR()" class="option-select">
                <option value="200">Small (200px)</option>
                <option value="300">Medium (300px)</option>
                <option value="400">Large (400px)</option>
                <option value="500">Extra Large (500px)</option>
              </select>
            </div>
            <div class="option-group">
              <label>Error Correction:</label>
              <select [(ngModel)]="errorCorrection" (change)="generateQR()" class="option-select">
                <option value="L">Low (7%)</option>
                <option value="M">Medium (15%)</option>
                <option value="Q">Quartile (25%)</option>
                <option value="H">High (30%)</option>
              </select>
            </div>
            <div class="option-group">
              <label>Background Color:</label>
              <input 
                type="color" 
                [(ngModel)]="backgroundColor" 
                (change)="generateQR()"
                class="color-input"
              >
            </div>
            <div class="option-group">
              <label>Foreground Color:</label>
              <input 
                type="color" 
                [(ngModel)]="foregroundColor" 
                (change)="generateQR()"
                class="color-input"
              >
            </div>
          </div>
        </div>
        
        <div class="qr-output" *ngIf="qrCodeUrl()">
          <div class="section-header">
            <h3>Generated QR Code</h3>
            <div class="output-actions">
              <button (click)="downloadQR()" class="action-button">
                💾 Download
              </button>
              <button (click)="copyQRImage()" class="action-button">
                📋 Copy Image
              </button>
            </div>
          </div>
          <div class="qr-display">
            <img [src]="qrCodeUrl()" [alt]="'QR Code for: ' + inputText" class="qr-image">
          </div>
          <div class="qr-info">
            <p><strong>Data:</strong> {{ inputText }}</p>
            <p><strong>Size:</strong> {{ qrSize }}x{{ qrSize }} pixels</p>
            <p><strong>Error Correction:</strong> {{ getErrorCorrectionName() }}</p>
          </div>
        </div>
        
        <div class="qr-examples">
          <h3>Quick Examples</h3>
          <div class="examples-grid">
            <div class="example-item" *ngFor="let example of examples">
              <div class="example-content">
                <div class="example-text">{{ example.text }}</div>
                <div class="example-type">{{ example.type }}</div>
              </div>
              <button (click)="loadExample(example)" class="load-example-button">
                Load
              </button>
            </div>
          </div>
        </div>
        
        <div class="qr-info-section">
          <h3>About QR Codes</h3>
          <div class="info-content">
            <p>QR (Quick Response) codes are two-dimensional barcodes that can store various types of data:</p>
            <ul>
              <li><strong>URLs:</strong> Direct links to websites</li>
              <li><strong>Text:</strong> Plain text messages</li>
              <li><strong>Contact Info:</strong> vCard format</li>
              <li><strong>WiFi:</strong> Network credentials</li>
              <li><strong>Email:</strong> Email addresses and messages</li>
              <li><strong>SMS:</strong> Text message content</li>
            </ul>
            <p><strong>Error Correction Levels:</strong></p>
            <ul>
              <li><strong>L (7%):</strong> For clean environments</li>
              <li><strong>M (15%):</strong> Standard level</li>
              <li><strong>Q (25%):</strong> For damaged codes</li>
              <li><strong>H (30%):</strong> Maximum error correction</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .qr-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 2rem;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    
    .qr-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    
    .qr-header h1 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 2rem;
    }
    
    .qr-header p {
      margin: 0;
      color: #666;
    }
    
    .qr-content {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
    
    .input-section, .qr-output {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 1.5rem;
      border: 1px solid #e0e0e0;
    }
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    
    .section-header h3 {
      margin: 0;
      color: #333;
      font-size: 1.2rem;
    }
    
    .input-actions, .output-actions {
      display: flex;
      gap: 0.5rem;
    }
    
    .action-button {
      padding: 0.5rem 1rem;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: background 0.3s ease;
    }
    
    .action-button:hover:not(:disabled) {
      background: #5a6fd8;
    }
    
    .action-button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    
    .qr-input {
      width: 100%;
      min-height: 120px;
      padding: 1rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
      resize: vertical;
      outline: none;
      transition: border-color 0.3s ease;
    }
    
    .qr-input:focus {
      border-color: #667eea;
    }
    
    .input-stats {
      display: flex;
      gap: 1rem;
      margin-top: 0.5rem;
      font-size: 0.8rem;
      color: #666;
    }
    
    .qr-options {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 1.5rem;
      border: 1px solid #e0e0e0;
    }
    
    .qr-options h3 {
      margin: 0 0 1rem 0;
      color: #333;
      font-size: 1.2rem;
    }
    
    .options-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }
    
    .option-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .option-group label {
      font-weight: 600;
      color: #333;
      font-size: 0.9rem;
    }
    
    .option-select {
      padding: 0.5rem;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      background: white;
      cursor: pointer;
      outline: none;
      transition: border-color 0.3s ease;
    }
    
    .option-select:focus {
      border-color: #667eea;
    }
    
    .color-input {
      width: 100%;
      height: 40px;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      cursor: pointer;
      outline: none;
    }
    
    .qr-display {
      text-align: center;
      margin: 1rem 0;
      padding: 1rem;
      background: white;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
    }
    
    .qr-image {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
    }
    
    .qr-info {
      background: white;
      border-radius: 8px;
      padding: 1rem;
      border: 1px solid #e0e0e0;
    }
    
    .qr-info p {
      margin: 0.5rem 0;
      font-size: 0.9rem;
      color: #333;
    }
    
    .qr-examples {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 1.5rem;
      border: 1px solid #e0e0e0;
    }
    
    .qr-examples h3 {
      margin: 0 0 1rem 0;
      color: #333;
      font-size: 1.2rem;
    }
    
    .examples-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }
    
    .example-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: white;
      border-radius: 8px;
      padding: 1rem;
      border: 1px solid #e0e0e0;
    }
    
    .example-content {
      flex: 1;
    }
    
    .example-text {
      font-weight: 600;
      color: #333;
      margin-bottom: 0.25rem;
      word-break: break-all;
    }
    
    .example-type {
      font-size: 0.8rem;
      color: #666;
    }
    
    .load-example-button {
      padding: 0.5rem 1rem;
      background: #f8f9fa;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.3s ease;
    }
    
    .load-example-button:hover {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }
    
    .qr-info-section {
      background: #e3f2fd;
      border-radius: 12px;
      padding: 1.5rem;
      border: 1px solid #bbdefb;
    }
    
    .qr-info-section h3 {
      margin: 0 0 1rem 0;
      color: #1976d2;
      font-size: 1.2rem;
    }
    
    .info-content p {
      margin: 0 0 1rem 0;
      color: #333;
      line-height: 1.6;
    }
    
    .info-content ul {
      margin: 0 0 1rem 0;
      padding-left: 1.5rem;
    }
    
    .info-content li {
      margin-bottom: 0.5rem;
      color: #333;
    }
    
    @media (max-width: 768px) {
      .qr-container {
        padding: 1rem;
      }
      
      .section-header {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }
      
      .input-actions, .output-actions {
        justify-content: center;
      }
      
      .options-grid {
        grid-template-columns: 1fr;
      }
      
      .example-item {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }
    }
  `]
})
export class QrGeneratorComponent {
  inputText = '';
  qrCodeUrl = signal<string>('');
  qrSize = 300;
  errorCorrection = 'M';
  backgroundColor = '#ffffff';
  foregroundColor = '#000000';

  examples = [
    {
      text: 'https://angular.dev',
      type: 'Website URL'
    },
    {
      text: 'Hello, World!',
      type: 'Plain Text'
    },
    {
      text: 'mailto:test@example.com?subject=Hello&body=Hi there!',
      type: 'Email'
    },
    {
      text: 'tel:+1234567890',
      type: 'Phone Number'
    },
    {
      text: 'WIFI:T:WPA;S:MyNetwork;P:password123;H:false;',
      type: 'WiFi Credentials'
    },
    {
      text: 'BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nORG:Company\nTEL:+1234567890\nEMAIL:john@example.com\nEND:VCARD',
      type: 'Contact Card (vCard)'
    }
  ];

  ngOnInit() {
    // Generate QR code on component init if there's input
    if (this.inputText) {
      this.generateQR();
    }
  }

  generateQR() {
    if (!this.inputText.trim()) {
      this.qrCodeUrl.set('');
      return;
    }

    try {
      // Using a simple QR code generation approach
      // In a real app, you'd use a QR code library like qrcode.js
      const qrData = this.inputText;
      const size = this.qrSize;
      const errorCorrection = this.errorCorrection;
      const bgColor = this.backgroundColor.replace('#', '');
      const fgColor = this.foregroundColor.replace('#', '');
      
      // For demo purposes, we'll use a QR code API service
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(qrData)}&ecc=${errorCorrection}&bgcolor=${bgColor}&color=${fgColor}`;
      
      this.qrCodeUrl.set(qrUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      this.qrCodeUrl.set('');
    }
  }

  clearInput() {
    this.inputText = '';
    this.qrCodeUrl.set('');
  }

  async pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      this.inputText = text;
      this.generateQR();
    } catch (error) {
      console.error('Failed to paste from clipboard:', error);
    }
  }

  loadExample(example: any) {
    this.inputText = example.text;
    this.generateQR();
  }

  downloadQR() {
    if (this.qrCodeUrl()) {
      const link = document.createElement('a');
      link.href = this.qrCodeUrl()!;
      link.download = `qrcode-${Date.now()}.png`;
      link.click();
    }
  }

  async copyQRImage() {
    if (this.qrCodeUrl()) {
      try {
        const response = await fetch(this.qrCodeUrl()!);
        const blob = await response.blob();
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
      } catch (error) {
        console.error('Failed to copy QR code image:', error);
      }
    }
  }

  getInputType(): string {
    if (!this.inputText.trim()) return 'Empty';
    
    if (this.inputText.startsWith('http://') || this.inputText.startsWith('https://')) {
      return 'URL';
    } else if (this.inputText.startsWith('mailto:')) {
      return 'Email';
    } else if (this.inputText.startsWith('tel:')) {
      return 'Phone';
    } else if (this.inputText.startsWith('WIFI:')) {
      return 'WiFi';
    } else if (this.inputText.startsWith('BEGIN:VCARD')) {
      return 'vCard';
    } else {
      return 'Text';
    }
  }

  getErrorCorrectionName(): string {
    const names = {
      'L': 'Low (7%)',
      'M': 'Medium (15%)',
      'Q': 'Quartile (25%)',
      'H': 'High (30%)'
    };
    return names[this.errorCorrection as keyof typeof names] || 'Medium (15%)';
  }
}
