import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dummy-data',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-container fade-in-up">
      <div class="tool-header">
        <div class="tool-icon-wrapper">
          <span class="tool-icon">📝</span>
        </div>
        <div>
          <h2>Dummy Data Generator</h2>
          <p>Generate placeholder text and mock JSON objects</p>
        </div>
      </div>

      <div class="tool-content generator-grid">
        
        <!-- Lorem Ipsum -->
        <div class="glass-card section-card">
          <div class="card-header">
            <h3>Lorem Ipsum Text</h3>
            <button class="btn-primary small" (click)="generateLorem()">Generate</button>
          </div>
          
          <div class="controls">
            <label>
              Paragraphs: {{ paragraphsCount() }}
              <input type="range" min="1" max="20" [(ngModel)]="paragraphsInput" (ngModelChange)="paragraphsCount.set($event)">
            </label>
          </div>

          <div class="output-wrapper">
            <div class="action-bar">
              <button class="btn-icon" (click)="copyToClipboard(loremOutput(), 'lorem')">
                <span class="icon">{{ copied() === 'lorem' ? '✓ Copied' : '📋 Copy Text' }}</span>
              </button>
            </div>
            <div class="output-box scrollable">
              <p *ngFor="let p of loremParagraphs()">{{ p }}</p>
            </div>
          </div>
        </div>

        <!-- Mock JSON -->
        <div class="glass-card section-card">
          <div class="card-header">
            <h3>Mock JSON Users</h3>
            <button class="btn-primary small" (click)="generateJson()">Generate</button>
          </div>
          
          <div class="controls">
            <label>
              Items Array Size: {{ jsonCount() }}
              <input type="range" min="1" max="50" [(ngModel)]="jsonCountInput" (ngModelChange)="jsonCount.set($event)">
            </label>
          </div>

          <div class="output-wrapper">
            <div class="action-bar">
              <button class="btn-icon" (click)="copyToClipboard(jsonOutput(), 'json')">
                <span class="icon">{{ copied() === 'json' ? '✓ Copied' : '📋 Copy JSON' }}</span>
              </button>
            </div>
            <pre class="output-box json-box scrollable">{{ jsonOutput() }}</pre>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .tool-container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
    .generator-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
    .section-card { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
    .card-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 1rem; }
    .card-header h3 { margin: 0; color: var(--accent-cyan); }
    .btn-primary.small { padding: 0.4rem 1rem; font-size: 0.9rem; }
    
    .controls { background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px; }
    .controls label { display: flex; flex-direction: column; gap: 0.75rem; color: var(--text-secondary); font-weight: 500; }
    input[type=range] { width: 100%; accent-color: var(--accent-pink); }
    
    .output-wrapper { display: flex; flex-direction: column; gap: 0.5rem; flex: 1; }
    .action-bar { display: flex; justify-content: flex-end; }
    .btn-icon { background: transparent; border: none; color: var(--text-secondary); cursor: pointer; font-size: 0.9rem; font-weight: 500; padding: 0.25rem 0.5rem; transition: color 0.3s; display: flex; align-items: center; gap: 0.5rem; }
    .btn-icon:hover { color: var(--accent-pink); }
    
    .output-box { background: rgba(0,0,0,0.3); padding: 1.5rem; border-radius: 8px; flex: 1; color: var(--text-primary); font-size: 1rem; line-height: 1.6; border: 1px solid rgba(255,255,255,0.05); }
    .output-box.scrollable { max-height: 500px; overflow-y: auto; }
    .output-box p { margin-top: 0; margin-bottom: 1rem; }
    .output-box p:last-child { margin-bottom: 0; }
    
    .json-box { font-family: monospace; font-size: 0.9rem; color: #a5b4fc; margin: 0; white-space: pre-wrap; }

    @media (max-width: 1024px) { .generator-grid { grid-template-columns: 1fr; } }
  `]
})
export class DummyDataComponent {
  paragraphsInput = 3;
  paragraphsCount = signal<number>(3);
  loremParagraphs = signal<string[]>([]);
  loremOutput = signal<string>('');

  jsonCountInput = 5;
  jsonCount = signal<number>(5);
  jsonOutput = signal<string>('');

  copied = signal<string>('');

  private loremSource = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

  constructor() {
    this.generateLorem();
    this.generateJson();
  }

  generateLorem() {
    const count = this.paragraphsCount();
    const paragraphs = [];
    for (let i = 0; i < count; i++) {
      // Just randomly shuffling sentences to make it look slightly different
      const sentences = this.loremSource.split('. ');
      for (let j = sentences.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1));
        [sentences[j], sentences[k]] = [sentences[k], sentences[j]];
      }
      paragraphs.push(sentences.join('. ').trim() + (sentences.join('').endsWith('.') ? '' : '.'));
    }
    this.loremParagraphs.set(paragraphs);
    this.loremOutput.set(paragraphs.join('\n\n'));
  }

  generateJson() {
    const count = this.jsonCount();
    const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'example.com', 'company.org'];

    const arr = [];
    for (let i = 0; i < count; i++) {
      const first = firstNames[Math.floor(Math.random() * firstNames.length)];
      const last = lastNames[Math.floor(Math.random() * lastNames.length)];
      const domain = domains[Math.floor(Math.random() * domains.length)];
      
      arr.push({
        id: crypto.randomUUID(),
        firstName: first,
        lastName: last,
        email: `${first.toLowerCase()}.${last.toLowerCase()}@${domain}`,
        isActive: Math.random() > 0.2,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString()
      });
    }

    this.jsonOutput.set(JSON.stringify(arr, null, 2));
  }

  copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    this.copied.set(id);
    setTimeout(() => this.copied.set(''), 2000);
  }
}
