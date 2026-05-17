import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-jwt-debugger',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-container fade-in-up">
      <div class="tool-header">
        <div class="tool-icon-wrapper">
          <span class="tool-icon">🔑</span>
        </div>
        <div>
          <h2>JWT Debugger</h2>
          <p>Decode and inspect JSON Web Tokens</p>
        </div>
      </div>

      <div class="tool-content jwt-grid">
        <div class="input-section glass-card">
          <h3>Encoded Token</h3>
          <textarea
            [(ngModel)]="token"
            (ngModelChange)="decodeToken()"
            class="glass-input token-input"
            placeholder="Paste your JWT here... (e.g. eyJhbGci...)"
            rows="10"
          ></textarea>
        </div>

        <div class="output-section">
          <div class="glass-card decoded-part header-part">
            <div class="part-label">HEADER: ALGORITHM & TOKEN TYPE</div>
            <pre class="json-output" [class.error]="headerError()">{{ headerJson() }}</pre>
          </div>

          <div class="glass-card decoded-part payload-part">
            <div class="part-label">PAYLOAD: DATA</div>
            <pre class="json-output" [class.error]="payloadError()">{{ payloadJson() }}</pre>
          </div>

          <div class="glass-card decoded-part signature-part">
            <div class="part-label">SIGNATURE</div>
            <pre class="json-output signature-output" [class.error]="signatureError()">{{ signature() }}</pre>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    .jwt-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin-top: 2rem;
    }
    .token-input {
      width: 100%;
      min-height: 400px;
      font-family: monospace;
      word-break: break-all;
      resize: vertical;
      font-size: 1rem;
      line-height: 1.5;
    }
    .output-section {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .decoded-part {
      padding: 1.5rem;
    }
    .part-label {
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 1px;
      margin-bottom: 1rem;
    }
    .header-part .part-label { color: #fb7185; } /* rose-400 */
    .payload-part .part-label { color: #c084fc; } /* purple-400 */
    .signature-part .part-label { color: #38bdf8; } /* sky-400 */
    
    .json-output {
      margin: 0;
      white-space: pre-wrap;
      word-break: break-all;
      font-family: monospace;
      font-size: 0.95rem;
      color: var(--text-primary);
    }
    .json-output.error {
      color: #ef4444; /* red-500 */
    }
    .signature-output {
      color: var(--text-secondary);
    }

    @media (max-width: 1024px) {
      .jwt-grid {
        grid-template-columns: 1fr;
      }
      .token-input {
        min-height: 200px;
      }
    }
  `]
})
export class JwtDebuggerComponent {
  token = signal<string>('');
  
  headerJson = signal<string>('{\n  \n}');
  payloadJson = signal<string>('{\n  \n}');
  signature = signal<string>('');
  
  headerError = signal<boolean>(false);
  payloadError = signal<boolean>(false);
  signatureError = signal<boolean>(false);

  decodeToken() {
    const val = this.token().trim();
    if (!val) {
      this.reset();
      return;
    }

    const parts = val.split('.');
    
    // Decode Header
    if (parts[0]) {
      try {
        const decoded = this.base64UrlDecode(parts[0]);
        this.headerJson.set(JSON.stringify(JSON.parse(decoded), null, 2));
        this.headerError.set(false);
      } catch (e) {
        this.headerJson.set('Invalid Base64Url string');
        this.headerError.set(true);
      }
    } else {
      this.headerJson.set('');
      this.headerError.set(false);
    }

    // Decode Payload
    if (parts[1]) {
      try {
        const decoded = this.base64UrlDecode(parts[1]);
        const parsed = JSON.parse(decoded);
        
        // Add human readable dates if they exist
        if (parsed.exp) parsed.exp = `${parsed.exp} (${new Date(parsed.exp * 1000).toLocaleString()})`;
        if (parsed.iat) parsed.iat = `${parsed.iat} (${new Date(parsed.iat * 1000).toLocaleString()})`;
        if (parsed.nbf) parsed.nbf = `${parsed.nbf} (${new Date(parsed.nbf * 1000).toLocaleString()})`;

        this.payloadJson.set(JSON.stringify(parsed, null, 2));
        this.payloadError.set(false);
      } catch (e) {
        this.payloadJson.set('Invalid Base64Url string');
        this.payloadError.set(true);
      }
    } else {
      this.payloadJson.set('');
      this.payloadError.set(false);
    }

    // Signature
    if (parts[2]) {
      this.signature.set(parts[2]);
      this.signatureError.set(false);
    } else {
      this.signature.set('');
      this.signatureError.set(false);
    }
  }

  private reset() {
    this.headerJson.set('{\n  \n}');
    this.payloadJson.set('{\n  \n}');
    this.signature.set('');
    this.headerError.set(false);
    this.payloadError.set(false);
    this.signatureError.set(false);
  }

  private base64UrlDecode(str: string): string {
    // Convert Base64Url to Base64
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    // Pad with '='
    while (base64.length % 4) {
      base64 += '=';
    }
    // Decode Base64 to Unicode string
    return decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  }
}
