import { Component, signal, computed, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-markdown-previewer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="tool-container fade-in-up">
      <div class="tool-header">
        <div class="tool-icon-wrapper">
          <span class="tool-icon">📝</span>
        </div>
        <div>
          <h2>Markdown Previewer</h2>
          <p>Live preview of Markdown text</p>
        </div>
      </div>

      <div class="tool-content md-grid">
        <div class="glass-card editor-section">
          <div class="card-header">
            <h3>Editor</h3>
          </div>
          <textarea
            [(ngModel)]="markdownText"
            (ngModelChange)="markdownText.set($event)"
            class="glass-input md-input scrollable"
            placeholder="Type your markdown here...&#10;&#10;# Heading 1&#10;## Heading 2&#10;&#10;**Bold text** and *italic text*&#10;&#10;- Item 1&#10;- Item 2&#10;&#10;[Link](https://example.com)&#10;&#10;\`\`\`javascript&#10;const x = 10;&#10;\`\`\`"
          ></textarea>
        </div>

        <div class="glass-card preview-section">
          <div class="card-header">
            <h3>Preview</h3>
          </div>
          <div class="md-preview scrollable" [innerHTML]="renderedHtml()"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-container { max-width: 1400px; margin: 0 auto; padding: 2rem; height: calc(100vh - 120px); display: flex; flex-direction: column; }
    .tool-header { margin-bottom: 2rem; flex-shrink: 0; }
    
    .md-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; flex: 1; min-height: 0; }
    
    .editor-section, .preview-section { display: flex; flex-direction: column; overflow: hidden; padding: 1.5rem; gap: 1rem; }
    .card-header { flex-shrink: 0; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 1rem; }
    .card-header h3 { margin: 0; color: var(--accent-cyan); }
    
    .md-input { width: 100%; flex: 1; resize: none; font-family: monospace; font-size: 1.05rem; line-height: 1.6; border: none; }
    .md-preview { flex: 1; color: var(--text-primary); font-size: 1.05rem; line-height: 1.6; padding: 1rem; background: rgba(0,0,0,0.2); border-radius: 8px; }
    
    .scrollable { overflow-y: auto; }
    
    /* Markdown Styles */
    .md-preview h1, .md-preview h2, .md-preview h3 { color: var(--accent-pink); margin-top: 1.5rem; margin-bottom: 1rem; line-height: 1.2; }
    .md-preview h1 { font-size: 2rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem; }
    .md-preview h2 { font-size: 1.5rem; }
    .md-preview h3 { font-size: 1.25rem; }
    .md-preview p { margin-bottom: 1rem; }
    .md-preview a { color: var(--accent-cyan); text-decoration: none; }
    .md-preview a:hover { text-decoration: underline; }
    .md-preview ul, .md-preview ol { margin-bottom: 1rem; padding-left: 2rem; }
    .md-preview li { margin-bottom: 0.25rem; }
    .md-preview code { font-family: monospace; background: rgba(255,255,255,0.1); padding: 0.2rem 0.4rem; border-radius: 4px; font-size: 0.9em; color: #a5b4fc; }
    .md-preview pre { background: rgba(0,0,0,0.5); padding: 1rem; border-radius: 8px; overflow-x: auto; margin-bottom: 1rem; border: 1px solid rgba(255,255,255,0.05); }
    .md-preview pre code { background: transparent; padding: 0; color: inherit; }
    .md-preview blockquote { border-left: 4px solid var(--accent-cyan); margin: 0 0 1rem 0; padding-left: 1rem; color: var(--text-secondary); font-style: italic; background: rgba(34, 211, 238, 0.05); padding-top: 0.5rem; padding-bottom: 0.5rem; border-radius: 0 8px 8px 0; }
    .md-preview img { max-width: 100%; border-radius: 8px; }
    .md-preview hr { border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 2rem 0; }

    @media (max-width: 1024px) { 
      .tool-container { height: auto; }
      .md-grid { grid-template-columns: 1fr; } 
      .md-input, .md-preview { min-height: 400px; flex: none; }
    }
  `]
})
export class MarkdownPreviewerComponent {
  markdownText = signal<string>('# Hello Markdown\n\nStart typing to see the live preview...\n\n- **Bold text**\n- *Italic text*\n- [A Link](https://example.com)\n\n> This is a blockquote\n\n```javascript\nconsole.log("Code block!");\n```');

  constructor(private sanitizer: DomSanitizer) {}

  renderedHtml = computed(() => {
    return this.sanitizer.bypassSecurityTrustHtml(this.parseMarkdown(this.markdownText()));
  });

  private parseMarkdown(text: string): string {
    if (!text) return '';
    
    let html = text;

    // VERY Basic Markdown Parser for preview purposes
    
    // Code blocks
    html = html.replace(/```[\s\S]*?```/g, (match) => {
      const code = match.replace(/^```.*\n/, '').replace(/\n```$/, '');
      // escape html inside code blocks
      const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `<pre><code>${escaped}</code></pre>`;
    });
    
    // Inline code
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');
    
    // Images
    html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img alt="$1" src="$2">');
    
    // Links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Bold & Italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
    
    // Horizontal Rule
    html = html.replace(/^---$/gim, '<hr>');

    // Lists (very basic)
    html = html.replace(/^\s*- (.*$)/gim, '<ul><li>$1</li></ul>');
    html = html.replace(/<\/ul>\n<ul>/gim, '\n'); // merge adjacent lists

    // Paragraphs (lines that don't start with a tag)
    const lines = html.split('\n');
    let inList = false;
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (line === '') {
        continue; // skip empty lines for paragraph wrapping
      }
      if (!line.match(/^<(h[1-6]|ul|ol|li|blockquote|pre|hr|img)/)) {
        lines[i] = `<p>${line}</p>`;
      }
    }
    html = lines.join('\n');

    return html;
  }
}
