import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-json-formatter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="json-container">
      <div class="json-header">
        <h1>📄 JSON Formatter & Viewer</h1>
        <p>Format, validate, and beautify JSON data</p>
      </div>
      
      <div class="json-content">
        <div class="input-section">
          <div class="section-header">
            <h3>JSON Input</h3>
            <div class="input-actions">
              <button (click)="clearInput()" class="action-button">
                🗑️ Clear
              </button>
              <button (click)="pasteFromClipboard()" class="action-button">
                📋 Paste
              </button>
              <button (click)="loadSample()" class="action-button">
                📝 Sample
              </button>
            </div>
          </div>
          <textarea 
            [(ngModel)]="inputJson" 
            placeholder="Paste your JSON here..."
            class="json-input"
            (input)="onInputChange()"
          ></textarea>
          <div class="input-stats">
            <span>Characters: {{ inputJson.length }}</span>
            <span>Lines: {{ getLineCount(inputJson) }}</span>
          </div>
        </div>
        
        <div class="action-buttons">
          <button (click)="formatJson()" class="format-button" [disabled]="!inputJson.trim()">
            ✨ Format & Beautify
          </button>
          <button (click)="minifyJson()" class="minify-button" [disabled]="!inputJson.trim()">
            📦 Minify
          </button>
          <button (click)="validateJson()" class="validate-button" [disabled]="!inputJson.trim()">
            ✅ Validate
          </button>
        </div>
        
        <div class="output-section">
          <div class="section-header">
            <h3>Formatted Output</h3>
            <div class="output-actions">
              <button (click)="copyOutput()" class="action-button" [disabled]="!formattedJson()">
                📋 Copy
              </button>
              <button (click)="downloadJson()" class="action-button" [disabled]="!formattedJson()">
                💾 Download
              </button>
              <button (click)="clearOutput()" class="action-button" [disabled]="!formattedJson()">
                🗑️ Clear
              </button>
            </div>
          </div>
          <div class="json-viewer" [class.error]="!isValidJson()">
            <pre *ngIf="formattedJson()" class="json-output">{{ formattedJson() }}</pre>
            <div *ngIf="!formattedJson()" class="placeholder">
              Formatted JSON will appear here...
            </div>
          </div>
          <div class="output-stats" *ngIf="formattedJson()">
            <span>Characters: {{ formattedJson()?.length || 0 }}</span>
            <span>Lines: {{ getLineCount(formattedJson() || '') }}</span>
            <span class="status" [class.success]="isValidJson()" [class.error]="!isValidJson()">
              {{ getStatusMessage() }}
            </span>
          </div>
        </div>
        
        <div class="json-tree" *ngIf="jsonTree().length > 0">
          <h3>JSON Tree View</h3>
          <div class="tree-container">
            <div *ngFor="let node of jsonTree()" class="tree-node">
              <div class="node-content" [style.padding-left.px]="node.level * 20">
                <span class="node-key" *ngIf="node.key">{{ node.key }}:</span>
                <span class="node-value" [class]="node.type">{{ node.value }}</span>
                <span class="node-type">{{ node.type }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="json-stats" *ngIf="jsonStats()">
          <h3>JSON Statistics</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">Total Keys:</span>
              <span class="stat-value">{{ jsonStats()?.totalKeys }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Object Count:</span>
              <span class="stat-value">{{ jsonStats()?.objectCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Array Count:</span>
              <span class="stat-value">{{ jsonStats()?.arrayCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">String Count:</span>
              <span class="stat-value">{{ jsonStats()?.stringCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Number Count:</span>
              <span class="stat-value">{{ jsonStats()?.numberCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Boolean Count:</span>
              <span class="stat-value">{{ jsonStats()?.booleanCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Null Count:</span>
              <span class="stat-value">{{ jsonStats()?.nullCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Max Depth:</span>
              <span class="stat-value">{{ jsonStats()?.maxDepth }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .json-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    
    .json-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    
    .json-header h1 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 2rem;
    }
    
    .json-header p {
      margin: 0;
      color: #666;
    }
    
    .json-content {
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
    
    .json-input {
      width: 100%;
      min-height: 200px;
      padding: 1rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
      resize: vertical;
      outline: none;
      transition: border-color 0.3s ease;
    }
    
    .json-input:focus {
      border-color: #667eea;
    }
    
    .input-stats, .output-stats {
      display: flex;
      gap: 1rem;
      margin-top: 0.5rem;
      font-size: 0.8rem;
      color: #666;
    }
    
    .action-buttons {
      display: flex;
      justify-content: center;
      gap: 1rem;
      flex-wrap: wrap;
    }
    
    .format-button, .minify-button, .validate-button {
      padding: 1rem 2rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 1rem;
    }
    
    .format-button {
      background: #4CAF50;
      color: white;
    }
    
    .format-button:hover:not(:disabled) {
      background: #45a049;
    }
    
    .minify-button {
      background: #ff9800;
      color: white;
    }
    
    .minify-button:hover:not(:disabled) {
      background: #f57c00;
    }
    
    .validate-button {
      background: #2196F3;
      color: white;
    }
    
    .validate-button:hover:not(:disabled) {
      background: #1976D2;
    }
    
    .format-button:disabled, .minify-button:disabled, .validate-button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    
    .json-viewer {
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      background: white;
      min-height: 200px;
      overflow: auto;
    }
    
    .json-viewer.error {
      border-color: #ff4757;
      background: #ffe6e6;
    }
    
    .json-output {
      margin: 0;
      padding: 1rem;
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
      line-height: 1.4;
      white-space: pre-wrap;
      word-break: break-word;
    }
    
    .placeholder {
      padding: 2rem;
      text-align: center;
      color: #666;
      font-style: italic;
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
    
    .json-tree {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 1.5rem;
      border: 1px solid #e0e0e0;
    }
    
    .json-tree h3 {
      margin: 0 0 1rem 0;
      color: #333;
      font-size: 1.2rem;
    }
    
    .tree-container {
      background: white;
      border-radius: 8px;
      padding: 1rem;
      border: 1px solid #e0e0e0;
      max-height: 300px;
      overflow-y: auto;
    }
    
    .tree-node {
      margin-bottom: 0.25rem;
    }
    
    .node-content {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
    }
    
    .node-key {
      font-weight: 600;
      color: #1976d2;
    }
    
    .node-value {
      color: #333;
    }
    
    .node-value.string {
      color: #4CAF50;
    }
    
    .node-value.number {
      color: #ff9800;
    }
    
    .node-value.boolean {
      color: #9c27b0;
    }
    
    .node-value.null {
      color: #666;
      font-style: italic;
    }
    
    .node-type {
      font-size: 0.8rem;
      color: #666;
      background: #e0e0e0;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
    }
    
    .json-stats {
      background: #e3f2fd;
      border-radius: 12px;
      padding: 1.5rem;
      border: 1px solid #bbdefb;
    }
    
    .json-stats h3 {
      margin: 0 0 1rem 0;
      color: #1976d2;
      font-size: 1.2rem;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
    }
    
    .stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem;
      background: white;
      border-radius: 6px;
      border: 1px solid #e0e0e0;
    }
    
    .stat-label {
      font-weight: 600;
      color: #666;
    }
    
    .stat-value {
      font-weight: 700;
      color: #1976d2;
    }
    
    @media (max-width: 768px) {
      .json-container {
        padding: 1rem;
      }
      
      .action-buttons {
        flex-direction: column;
        align-items: center;
      }
      
      .format-button, .minify-button, .validate-button {
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
      
      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class JsonFormatterComponent {
  inputJson = '';
  formattedJson = signal<string>('');
  isValidJson = signal<boolean>(true);
  jsonTree = signal<any[]>([]);
  jsonStats = signal<any>(null);

  sampleJson = `{
  "name": "John Doe",
  "age": 30,
  "isActive": true,
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "zipCode": "10001"
  },
  "hobbies": ["reading", "coding", "gaming"],
  "contact": {
    "email": "john@example.com",
    "phone": "+1-555-0123"
  },
  "metadata": null
}`;

  onInputChange() {
    this.validateJson();
  }

  formatJson() {
    try {
      const parsed = JSON.parse(this.inputJson);
      const formatted = JSON.stringify(parsed, null, 2);
      this.formattedJson.set(formatted);
      this.isValidJson.set(true);
      this.buildJsonTree(parsed);
      this.calculateStats(parsed);
    } catch (error) {
      this.formattedJson.set('');
      this.isValidJson.set(false);
      this.jsonTree.set([]);
      this.jsonStats.set(null);
    }
  }

  minifyJson() {
    try {
      const parsed = JSON.parse(this.inputJson);
      const minified = JSON.stringify(parsed);
      this.formattedJson.set(minified);
      this.isValidJson.set(true);
      this.buildJsonTree(parsed);
      this.calculateStats(parsed);
    } catch (error) {
      this.formattedJson.set('');
      this.isValidJson.set(false);
      this.jsonTree.set([]);
      this.jsonStats.set(null);
    }
  }

  validateJson() {
    try {
      JSON.parse(this.inputJson);
      this.isValidJson.set(true);
    } catch (error) {
      this.isValidJson.set(false);
    }
  }

  clearInput() {
    this.inputJson = '';
    this.formattedJson.set('');
    this.jsonTree.set([]);
    this.jsonStats.set(null);
  }

  clearOutput() {
    this.formattedJson.set('');
    this.jsonTree.set([]);
    this.jsonStats.set(null);
  }

  async copyOutput() {
    if (this.formattedJson()) {
      try {
        await navigator.clipboard.writeText(this.formattedJson()!);
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
    }
  }

  downloadJson() {
    if (this.formattedJson()) {
      const blob = new Blob([this.formattedJson()], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'formatted.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  async pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      this.inputJson = text;
      this.onInputChange();
    } catch (error) {
      console.error('Failed to paste from clipboard:', error);
    }
  }

  loadSample() {
    this.inputJson = this.sampleJson;
    this.onInputChange();
  }

  getStatusMessage(): string {
    if (!this.inputJson.trim()) return '';
    return this.isValidJson() ? 'Valid JSON' : 'Invalid JSON';
  }

  getLineCount(text: string): number {
    return text.split('\n').length;
  }

  private buildJsonTree(obj: any, level = 0, key = ''): void {
    const tree: any[] = [];
    
    if (typeof obj === 'object' && obj !== null) {
      if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          tree.push({
            key: `[${index}]`,
            value: typeof item === 'object' ? '{...}' : String(item),
            type: this.getType(item),
            level
          });
          if (typeof item === 'object' && item !== null) {
            this.buildJsonTree(item, level + 1, `[${index}]`);
          }
        });
      } else {
        Object.entries(obj).forEach(([k, v]) => {
          tree.push({
            key: k,
            value: typeof v === 'object' ? (Array.isArray(v) ? '[...]' : '{...}') : String(v),
            type: this.getType(v),
            level
          });
          if (typeof v === 'object' && v !== null) {
            this.buildJsonTree(v, level + 1, k);
          }
        });
      }
    }
    
    this.jsonTree.set(tree);
  }

  private getType(value: any): string {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  }

  private calculateStats(obj: any): void {
    const stats = {
      totalKeys: 0,
      objectCount: 0,
      arrayCount: 0,
      stringCount: 0,
      numberCount: 0,
      booleanCount: 0,
      nullCount: 0,
      maxDepth: 0
    };

    this.analyzeObject(obj, stats, 0);
    this.jsonStats.set(stats);
  }

  private analyzeObject(obj: any, stats: any, depth: number): void {
    stats.maxDepth = Math.max(stats.maxDepth, depth);

    if (obj === null) {
      stats.nullCount++;
      return;
    }

    if (Array.isArray(obj)) {
      stats.arrayCount++;
      obj.forEach(item => this.analyzeObject(item, stats, depth + 1));
    } else if (typeof obj === 'object') {
      stats.objectCount++;
      Object.entries(obj).forEach(([key, value]) => {
        stats.totalKeys++;
        this.analyzeObject(value, stats, depth + 1);
      });
    } else {
      switch (typeof obj) {
        case 'string':
          stats.stringCount++;
          break;
        case 'number':
          stats.numberCount++;
          break;
        case 'boolean':
          stats.booleanCount++;
          break;
      }
    }
  }
}
