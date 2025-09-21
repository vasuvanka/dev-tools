import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface TextTool {
  name: string;
  description: string;
  action: () => void;
}

@Component({
  selector: 'app-text-tools',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="text-tools-container">
      <div class="text-tools-header">
        <h1>📝 Text Tools</h1>
        <p>Various text manipulation and analysis tools</p>
      </div>
      
      <div class="text-tools-content">
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
              <button (click)="loadSample()" class="action-button">
                📝 Sample
              </button>
            </div>
          </div>
          <textarea 
            [(ngModel)]="inputText" 
            placeholder="Enter text to process..."
            class="text-input"
            (input)="updateStats()"
          ></textarea>
          <div class="input-stats">
            <span>Characters: {{ textStats().characters }}</span>
            <span>Words: {{ textStats().words }}</span>
            <span>Lines: {{ textStats().lines }}</span>
            <span>Paragraphs: {{ textStats().paragraphs }}</span>
          </div>
        </div>
        
        <div class="tools-section">
          <h3>Text Tools</h3>
          <div class="tools-grid">
            <div class="tool-item" *ngFor="let tool of textTools">
              <div class="tool-content">
                <h4>{{ tool.name }}</h4>
                <p>{{ tool.description }}</p>
              </div>
              <button (click)="tool.action()" class="tool-button" [disabled]="!inputText.trim()">
                Apply
              </button>
            </div>
          </div>
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
            placeholder="Processed text will appear here..."
            class="text-output"
          ></textarea>
        </div>
        
        <div class="analysis-section">
          <h3>Text Analysis</h3>
          <div class="analysis-grid">
            <div class="analysis-item">
              <span class="analysis-label">Character Count:</span>
              <span class="analysis-value">{{ textStats().characters }}</span>
            </div>
            <div class="analysis-item">
              <span class="analysis-label">Word Count:</span>
              <span class="analysis-value">{{ textStats().words }}</span>
            </div>
            <div class="analysis-item">
              <span class="analysis-label">Line Count:</span>
              <span class="analysis-value">{{ textStats().lines }}</span>
            </div>
            <div class="analysis-item">
              <span class="analysis-label">Paragraph Count:</span>
              <span class="analysis-value">{{ textStats().paragraphs }}</span>
            </div>
            <div class="analysis-item">
              <span class="analysis-label">Average Words per Line:</span>
              <span class="analysis-value">{{ textStats().avgWordsPerLine }}</span>
            </div>
            <div class="analysis-item">
              <span class="analysis-label">Reading Time:</span>
              <span class="analysis-value">{{ textStats().readingTime }} min</span>
            </div>
            <div class="analysis-item">
              <span class="analysis-label">Most Common Word:</span>
              <span class="analysis-value">{{ textStats().mostCommonWord }}</span>
            </div>
            <div class="analysis-item">
              <span class="analysis-label">Unique Words:</span>
              <span class="analysis-value">{{ textStats().uniqueWords }}</span>
            </div>
          </div>
        </div>
        
        <div class="conversion-section">
          <h3>Text Conversions</h3>
          <div class="conversion-grid">
            <div class="conversion-item">
              <h4>Case Conversions</h4>
              <div class="conversion-buttons">
                <button (click)="toUpperCase()" class="conversion-button">UPPERCASE</button>
                <button (click)="toLowerCase()" class="conversion-button">lowercase</button>
                <button (click)="toTitleCase()" class="conversion-button">Title Case</button>
                <button (click)="toCamelCase()" class="conversion-button">camelCase</button>
                <button (click)="toPascalCase()" class="conversion-button">PascalCase</button>
                <button (click)="toSnakeCase()" class="conversion-button">snake_case</button>
                <button (click)="toKebabCase()" class="conversion-button">kebab-case</button>
              </div>
            </div>
            
            <div class="conversion-item">
              <h4>Encoding/Decoding</h4>
              <div class="conversion-buttons">
                <button (click)="encodeBase64()" class="conversion-button">Base64 Encode</button>
                <button (click)="decodeBase64()" class="conversion-button">Base64 Decode</button>
                <button (click)="encodeUrl()" class="conversion-button">URL Encode</button>
                <button (click)="decodeUrl()" class="conversion-button">URL Decode</button>
                <button (click)="encodeHtml()" class="conversion-button">HTML Encode</button>
                <button (click)="decodeHtml()" class="conversion-button">HTML Decode</button>
              </div>
            </div>
            
            <div class="conversion-item">
              <h4>Text Transformations</h4>
              <div class="conversion-buttons">
                <button (click)="reverseText()" class="conversion-button">Reverse</button>
                <button (click)="removeDuplicates()" class="conversion-button">Remove Duplicates</button>
                <button (click)="sortLines()" class="conversion-button">Sort Lines</button>
                <button (click)="removeEmptyLines()" class="conversion-button">Remove Empty Lines</button>
                <button (click)="addLineNumbers()" class="conversion-button">Add Line Numbers</button>
                <button (click)="removeLineNumbers()" class="conversion-button">Remove Line Numbers</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .text-tools-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    
    .text-tools-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    
    .text-tools-header h1 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 2rem;
    }
    
    .text-tools-header p {
      margin: 0;
      color: #666;
    }
    
    .text-tools-content {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
    
    .input-section, .output-section, .tools-section, .analysis-section, .conversion-section {
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
    
    .input-stats {
      display: flex;
      gap: 1rem;
      margin-top: 0.5rem;
      font-size: 0.8rem;
      color: #666;
      flex-wrap: wrap;
    }
    
    .tools-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
    }
    
    .tool-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: white;
      border-radius: 8px;
      padding: 1rem;
      border: 1px solid #e0e0e0;
    }
    
    .tool-content {
      flex: 1;
    }
    
    .tool-content h4 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 1rem;
    }
    
    .tool-content p {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }
    
    .tool-button {
      padding: 0.5rem 1rem;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: background 0.3s ease;
    }
    
    .tool-button:hover:not(:disabled) {
      background: #45a049;
    }
    
    .tool-button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    
    .analysis-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }
    
    .analysis-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: white;
      padding: 1rem;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
    }
    
    .analysis-label {
      font-weight: 600;
      color: #666;
    }
    
    .analysis-value {
      font-weight: 700;
      color: #333;
      font-family: 'Courier New', monospace;
    }
    
    .conversion-grid {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
    
    .conversion-item {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      border: 1px solid #e0e0e0;
    }
    
    .conversion-item h4 {
      margin: 0 0 1rem 0;
      color: #333;
      font-size: 1.1rem;
    }
    
    .conversion-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    
    .conversion-button {
      padding: 0.5rem 1rem;
      background: #f8f9fa;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.3s ease;
    }
    
    .conversion-button:hover {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }
    
    @media (max-width: 768px) {
      .text-tools-container {
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
      
      .tool-item {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }
      
      .conversion-buttons {
        justify-content: center;
      }
    }
  `]
})
export class TextToolsComponent {
  inputText = '';
  outputText = signal<string>('');
  textStats = signal<any>({
    characters: 0,
    words: 0,
    lines: 0,
    paragraphs: 0,
    avgWordsPerLine: 0,
    readingTime: 0,
    mostCommonWord: '',
    uniqueWords: 0
  });

  textTools: TextTool[] = [
    {
      name: 'Remove Extra Spaces',
      description: 'Remove multiple consecutive spaces',
      action: () => this.removeExtraSpaces()
    },
    {
      name: 'Remove Line Breaks',
      description: 'Remove all line breaks and make text single line',
      action: () => this.removeLineBreaks()
    },
    {
      name: 'Add Line Breaks',
      description: 'Add line breaks after sentences',
      action: () => this.addLineBreaks()
    },
    {
      name: 'Extract URLs',
      description: 'Extract all URLs from text',
      action: () => this.extractUrls()
    },
    {
      name: 'Extract Emails',
      description: 'Extract all email addresses from text',
      action: () => this.extractEmails()
    },
    {
      name: 'Extract Numbers',
      description: 'Extract all numbers from text',
      action: () => this.extractNumbers()
    }
  ];

  sampleText = `Hello World! This is a sample text for testing various text tools.

It contains multiple lines, some numbers like 123 and 456, and an email address: test@example.com.

You can also find URLs like https://angular.dev and http://www.google.com.

This text has various formatting and can be used to test different text manipulation functions.`;

  ngOnInit() {
    this.updateStats();
  }

  updateStats() {
    const text = this.inputText;
    const words = text.trim() ? text.trim().split(/\s+/) : [];
    const lines = text.split('\n');
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
    
    // Word frequency analysis
    const wordFreq: { [key: string]: number } = {};
    words.forEach(word => {
      const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
      if (cleanWord) {
        wordFreq[cleanWord] = (wordFreq[cleanWord] || 0) + 1;
      }
    });
    
    const mostCommonWord = Object.keys(wordFreq).reduce((a, b) => 
      wordFreq[a] > wordFreq[b] ? a : b, '') || '';
    
    this.textStats.set({
      characters: text.length,
      words: words.length,
      lines: lines.length,
      paragraphs: paragraphs.length,
      avgWordsPerLine: lines.length > 0 ? Math.round(words.length / lines.length * 10) / 10 : 0,
      readingTime: Math.ceil(words.length / 200), // Assuming 200 words per minute
      mostCommonWord: mostCommonWord,
      uniqueWords: Object.keys(wordFreq).length
    });
  }

  clearInput() {
    this.inputText = '';
    this.outputText.set('');
    this.updateStats();
  }

  clearOutput() {
    this.outputText.set('');
  }

  async copyOutput() {
    if (this.outputText()) {
      try {
        await navigator.clipboard.writeText(this.outputText()!);
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
    }
  }

  async pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      this.inputText = text;
      this.updateStats();
    } catch (error) {
      console.error('Failed to paste from clipboard:', error);
    }
  }

  loadSample() {
    this.inputText = this.sampleText;
    this.updateStats();
  }

  // Text manipulation functions
  removeExtraSpaces() {
    this.outputText.set(this.inputText.replace(/\s+/g, ' ').trim());
  }

  removeLineBreaks() {
    this.outputText.set(this.inputText.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim());
  }

  addLineBreaks() {
    this.outputText.set(this.inputText.replace(/\. /g, '.\n').replace(/\? /g, '?\n').replace(/! /g, '!\n'));
  }

  extractUrls() {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = this.inputText.match(urlRegex) || [];
    this.outputText.set(urls.join('\n'));
  }

  extractEmails() {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = this.inputText.match(emailRegex) || [];
    this.outputText.set(emails.join('\n'));
  }

  extractNumbers() {
    const numberRegex = /\d+(\.\d+)?/g;
    const numbers = this.inputText.match(numberRegex) || [];
    this.outputText.set(numbers.join('\n'));
  }

  // Case conversions
  toUpperCase() {
    this.outputText.set(this.inputText.toUpperCase());
  }

  toLowerCase() {
    this.outputText.set(this.inputText.toLowerCase());
  }

  toTitleCase() {
    this.outputText.set(this.inputText.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    ));
  }

  toCamelCase() {
    this.outputText.set(this.inputText.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
      index === 0 ? word.toLowerCase() : word.toUpperCase()
    ).replace(/\s+/g, ''));
  }

  toPascalCase() {
    this.outputText.set(this.inputText.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => 
      word.toUpperCase()
    ).replace(/\s+/g, ''));
  }

  toSnakeCase() {
    this.outputText.set(this.inputText.replace(/\W+/g, ' ')
      .split(/ |\B(?=[A-Z])/)
      .map(word => word.toLowerCase())
      .join('_'));
  }

  toKebabCase() {
    this.outputText.set(this.inputText.replace(/\W+/g, ' ')
      .split(/ |\B(?=[A-Z])/)
      .map(word => word.toLowerCase())
      .join('-'));
  }

  // Encoding/Decoding
  encodeBase64() {
    try {
      this.outputText.set(btoa(unescape(encodeURIComponent(this.inputText))));
    } catch (error) {
      this.outputText.set('Error: Invalid input for Base64 encoding');
    }
  }

  decodeBase64() {
    try {
      this.outputText.set(decodeURIComponent(escape(atob(this.inputText))));
    } catch (error) {
      this.outputText.set('Error: Invalid Base64 string');
    }
  }

  encodeUrl() {
    this.outputText.set(encodeURIComponent(this.inputText));
  }

  decodeUrl() {
    this.outputText.set(decodeURIComponent(this.inputText));
  }

  encodeHtml() {
    this.outputText.set(this.inputText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;'));
  }

  decodeHtml() {
    this.outputText.set(this.inputText
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'"));
  }

  // Text transformations
  reverseText() {
    this.outputText.set(this.inputText.split('').reverse().join(''));
  }

  removeDuplicates() {
    const lines = this.inputText.split('\n');
    const uniqueLines = [...new Set(lines)];
    this.outputText.set(uniqueLines.join('\n'));
  }

  sortLines() {
    const lines = this.inputText.split('\n');
    this.outputText.set(lines.sort().join('\n'));
  }

  removeEmptyLines() {
    this.outputText.set(this.inputText.split('\n').filter(line => line.trim()).join('\n'));
  }

  addLineNumbers() {
    const lines = this.inputText.split('\n');
    this.outputText.set(lines.map((line, index) => `${index + 1}: ${line}`).join('\n'));
  }

  removeLineNumbers() {
    this.outputText.set(this.inputText.replace(/^\d+:\s*/gm, ''));
  }
}
