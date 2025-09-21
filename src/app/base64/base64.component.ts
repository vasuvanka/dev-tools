import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-base64',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="base64-container">
      <div class="base64-header">
        <h1>🔐 Base64 Encoder & Decoder</h1>
        <p>Encode and decode text using Base64 encoding</p>
      </div>
      
      <div class="base64-content">
        <div class="input-section">
          <div class="section-header">
            <h3>Input Text</h3>
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
            placeholder="Enter text to encode or paste Base64 to decode..."
            class="text-input"
            (input)="onInputChange()"
          ></textarea>
          <div class="input-stats">
            <span>Characters: {{ inputText.length }}</span>
            <span>Bytes: {{ getByteLength(inputText) }}</span>
          </div>
        </div>
        
        <div class="action-buttons">
          <button (click)="encodeText()" class="encode-button" [disabled]="!inputText.trim()">
            🔒 Encode to Base64
          </button>
          <button (click)="decodeText()" class="decode-button" [disabled]="!inputText.trim()">
            🔓 Decode from Base64
          </button>
        </div>
        
        <div class="output-section">
          <div class="section-header">
            <h3>Output</h3>
            <div class="output-actions">
              <button (click)="copyOutput()" class="action-button" [disabled]="!outputText()">
                📋 Copy
              </button>
              <button (click)="clearOutput()" class="action-button" [disabled]="!outputText()">
                🗑️ Clear
              </button>
            </div>
          </div>
          <textarea 
            [value]="outputText()" 
            readonly 
            placeholder="Encoded or decoded text will appear here..."
            class="text-output"
          ></textarea>
          <div class="output-stats" *ngIf="outputText()">
            <span>Characters: {{ outputText()?.length || 0 }}</span>
            <span>Bytes: {{ getByteLength(outputText() || '') }}</span>
            <span class="status" [class.success]="lastOperationSuccess()" [class.error]="!lastOperationSuccess()">
              {{ lastOperationMessage() }}
            </span>
          </div>
        </div>
        
        <div class="examples-section">
          <h3>Examples</h3>
          <div class="examples-grid">
            <div class="example-item" *ngFor="let example of examples">
              <div class="example-text">{{ example.text }}</div>
              <div class="example-encoded">{{ example.encoded }}</div>
              <button (click)="loadExample(example)" class="load-example-button">
                Load Example
              </button>
            </div>
          </div>
        </div>
        
        <div class="info-section">
          <h3>About Base64</h3>
          <div class="info-content">
            <p>Base64 is a binary-to-text encoding scheme that represents binary data in an ASCII string format. It's commonly used for:</p>
            <ul>
              <li>Email attachments</li>
              <li>Data URLs in web pages</li>
              <li>Storing binary data in text-based formats</li>
              <li>API authentication (Basic Auth)</li>
            </ul>
            <p><strong>Note:</strong> This tool works with text input. For binary files, use a file upload tool.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .base64-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 2rem;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    
    .base64-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    
    .base64-header h1 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 2rem;
    }
    
    .base64-header p {
      margin: 0;
      color: #666;
    }
    
    .base64-content {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
    
    .input-section, .output-section {
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
    
    .text-input, .text-output {
      width: 100%;
      min-height: 150px;
      padding: 1rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
      resize: vertical;
      outline: none;
      transition: border-color 0.3s ease;
    }
    
    .text-input:focus {
      border-color: #667eea;
    }
    
    .text-output {
      background: white;
      color: #333;
    }
    
    .input-stats, .output-stats {
      display: flex;
      gap: 1rem;
      margin-top: 0.5rem;
      font-size: 0.8rem;
      color: #666;
    }
    
    .status {
      font-weight: 600;
    }
    
    .status.success {
      color: #4CAF50;
    }
    
    .status.error {
      color: #ff4757;
    }
    
    .action-buttons {
      display: flex;
      justify-content: center;
      gap: 1rem;
    }
    
    .encode-button, .decode-button {
      padding: 1rem 2rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 1rem;
    }
    
    .encode-button {
      background: #4CAF50;
      color: white;
    }
    
    .encode-button:hover:not(:disabled) {
      background: #45a049;
    }
    
    .decode-button {
      background: #ff9800;
      color: white;
    }
    
    .decode-button:hover:not(:disabled) {
      background: #f57c00;
    }
    
    .encode-button:disabled, .decode-button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    
    .examples-section {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 1.5rem;
      border: 1px solid #e0e0e0;
    }
    
    .examples-section h3 {
      margin: 0 0 1rem 0;
      color: #333;
      font-size: 1.2rem;
    }
    
    .examples-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
    }
    
    .example-item {
      background: white;
      border-radius: 8px;
      padding: 1rem;
      border: 1px solid #e0e0e0;
    }
    
    .example-text {
      font-weight: 600;
      color: #333;
      margin-bottom: 0.5rem;
      word-break: break-all;
    }
    
    .example-encoded {
      font-family: 'Courier New', monospace;
      font-size: 0.8rem;
      color: #666;
      margin-bottom: 0.5rem;
      word-break: break-all;
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
    
    .info-section {
      background: #e3f2fd;
      border-radius: 12px;
      padding: 1.5rem;
      border: 1px solid #bbdefb;
    }
    
    .info-section h3 {
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
      .base64-container {
        padding: 1rem;
      }
      
      .action-buttons {
        flex-direction: column;
        align-items: center;
      }
      
      .encode-button, .decode-button {
        width: 200px;
      }
      
      .section-header {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }
      
      .input-actions, .output-actions {
        justify-content: center;
      }
    }
  `]
})
export class Base64Component {
  inputText = '';
  outputText = signal<string>('');
  lastOperationSuccess = signal<boolean>(true);
  lastOperationMessage = signal<string>('');

  examples = [
    {
      text: 'Hello, World!',
      encoded: 'SGVsbG8sIFdvcmxkIQ=='
    },
    {
      text: 'Base64 encoding is useful',
      encoded: 'QmFzZTY0IGVuY29kaW5nIGlzIHVzZWZ1bA=='
    },
    {
      text: 'Angular is awesome! 🚀',
      encoded: 'QW5ndWxhciBpcyBhd2Vzb21lISDwn5qA'
    },
    {
      text: 'JSON: {"name": "test", "value": 123}',
      encoded: 'SlNPTjogeyJuYW1lIjogInRlc3QiLCAidmFsdWUiOiAxMjN9'
    }
  ];

  onInputChange() {
    // Auto-detect if input looks like Base64 and suggest decode
    if (this.inputText.trim() && this.isValidBase64(this.inputText.trim())) {
      this.lastOperationMessage.set('Input appears to be Base64. Try decoding!');
    } else {
      this.lastOperationMessage.set('');
    }
  }

  encodeText() {
    try {
      const encoded = btoa(unescape(encodeURIComponent(this.inputText)));
      this.outputText.set(encoded);
      this.lastOperationSuccess.set(true);
      this.lastOperationMessage.set('Text encoded successfully!');
    } catch (error) {
      this.outputText.set('');
      this.lastOperationSuccess.set(false);
      this.lastOperationMessage.set('Error: Failed to encode text');
    }
  }

  decodeText() {
    try {
      const decoded = decodeURIComponent(escape(atob(this.inputText)));
      this.outputText.set(decoded);
      this.lastOperationSuccess.set(true);
      this.lastOperationMessage.set('Text decoded successfully!');
    } catch (error) {
      this.outputText.set('');
      this.lastOperationSuccess.set(false);
      this.lastOperationMessage.set('Error: Invalid Base64 string');
    }
  }

  clearInput() {
    this.inputText = '';
    this.outputText.set('');
    this.lastOperationMessage.set('');
  }

  clearOutput() {
    this.outputText.set('');
    this.lastOperationMessage.set('');
  }

  async copyOutput() {
    if (this.outputText()) {
      try {
        await navigator.clipboard.writeText(this.outputText());
        this.lastOperationMessage.set('Output copied to clipboard!');
      } catch (error) {
        this.lastOperationMessage.set('Failed to copy to clipboard');
      }
    }
  }

  async pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      this.inputText = text;
      this.onInputChange();
    } catch (error) {
      this.lastOperationMessage.set('Failed to paste from clipboard');
    }
  }

  loadExample(example: any) {
    this.inputText = example.text;
    this.outputText.set(example.encoded);
    this.lastOperationMessage.set('Example loaded!');
  }

  private isValidBase64(str: string): boolean {
    try {
      return btoa(atob(str)) === str;
    } catch (err) {
      return false;
    }
  }

  getByteLength(str: string): number {
    return new Blob([str]).size;
  }
}
