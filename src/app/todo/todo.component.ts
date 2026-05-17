import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface TodoItem {
  id: string; // Changed to string to use Date.now() string or UUID
  text: string;
  completed: boolean;
  createdAt: number; // Storing timestamp for easier serialization
}

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="todo-container fade-in-up">
      <div class="todo-content">
        <div class="todo-header">
          <div class="title-wrapper">
            <span class="title-icon glow-pulse">📝</span>
            <h1>Todo List</h1>
          </div>
          
          <div class="progress-section">
            <div class="progress-info">
              <span class="progress-label">Progress</span>
              <span class="progress-text">{{ completedCount() }} / {{ todos().length }}</span>
            </div>
            <div class="progress-bar-bg">
              <div class="progress-fill glow-cyan" [style.width.%]="progressPercentage()"></div>
            </div>
          </div>
        </div>
        
        <div class="add-todo-wrapper">
          <div class="input-glow glow-pink"></div>
          <div class="add-todo group">
            <input 
              type="text" 
              [(ngModel)]="newTodoText" 
              placeholder="What needs to be done?"
              (keyup.enter)="addTodo()"
              class="todo-input glass-input"
            >
            <button 
              (click)="addTodo()" 
              class="add-button glass-button glass-button-pink" 
              [disabled]="!newTodoText.trim()"
            >
              Add Task
            </button>
          </div>
        </div>
        
        <div class="todo-list">
          <div 
            *ngFor="let todo of todos(); trackBy: trackByFn" 
            class="todo-item group"
            [class.completed]="todo.completed"
          >
            <!-- Glowing background that appears on hover -->
            <div class="item-glow" [ngClass]="todo.completed ? 'glow-green' : 'glow-blue'"></div>
            
            <div class="item-content glass-card">
              <label class="custom-checkbox">
                <input 
                  type="checkbox" 
                  [checked]="todo.completed"
                  (change)="toggleTodo(todo.id)"
                >
                <span class="checkmark"></span>
              </label>
              
              <div class="todo-details">
                <span class="todo-text">{{ todo.text }}</span>
                <span class="todo-time">{{ formatDate(todo.createdAt) }}</span>
              </div>
              
              <button (click)="deleteTodo(todo.id)" class="delete-btn" title="Delete Task">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
          
          <div *ngIf="todos().length === 0" class="empty-state">
            <div class="empty-icon glow-pulse">✨</div>
            <h3>All caught up!</h3>
            <p>You have no pending tasks. Add one above to get started.</p>
          </div>
        </div>
        
        <div class="todo-actions" *ngIf="todos().length > 0">
          <button 
            (click)="clearCompleted()" 
            class="action-btn glass-button glass-button-blue" 
            [disabled]="completedCount() === 0"
          >
            Clear Completed
          </button>
          <button 
            (click)="clearAll()" 
            class="action-btn glass-button glass-button-pink"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .todo-container {
      max-width: 700px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }
    
    .todo-content {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
    
    /* Header & Progress */
    .todo-header {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      background: rgba(24, 24, 27, 0.4);
      padding: 2rem;
      border-radius: 24px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .title-wrapper {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .title-icon {
      font-size: 2.5rem;
      filter: drop-shadow(0 0 15px rgba(236, 72, 153, 0.5));
    }
    
    @keyframes pulse-soft {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    
    .glow-pulse {
      animation: pulse-soft 3s infinite ease-in-out;
    }
    
    .todo-header h1 {
      margin: 0;
      color: var(--text-primary);
      font-size: 2.5rem;
      font-weight: 700;
      letter-spacing: -1px;
    }
    
    .progress-section {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    
    .progress-info {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    
    .progress-label {
      font-size: 0.9rem;
      color: var(--text-secondary);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .progress-text {
      font-weight: 700;
      color: var(--text-primary);
      font-size: 1.2rem;
    }
    
    .progress-bar-bg {
      height: 8px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 4px;
      overflow: hidden;
      position: relative;
    }
    
    .progress-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      background: var(--gradient-aurora);
      box-shadow: 0 0 10px rgba(34, 211, 238, 0.5);
    }
    
    /* Input Section */
    .add-todo-wrapper {
      position: relative;
    }
    
    .input-glow {
      position: absolute;
      top: -20px; left: -20px; right: -20px; bottom: -20px;
      background: rgba(236, 72, 153, 0.15);
      filter: blur(30px);
      border-radius: 40px;
      opacity: 0;
      transition: opacity 0.3s;
      pointer-events: none;
      z-index: 0;
    }
    
    .add-todo-wrapper:focus-within .input-glow {
      opacity: 1;
    }
    
    .add-todo {
      position: relative;
      z-index: 1;
      display: flex;
      gap: 1rem;
      background: rgba(24, 24, 27, 0.6);
      padding: 0.75rem;
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }
    
    .todo-input {
      flex: 1;
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      padding: 0.5rem 1rem !important;
      font-size: 1.1rem;
    }
    
    .todo-input:focus {
      outline: none;
    }
    
    .add-button {
      padding: 0.75rem 2rem;
      border-radius: 14px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    
    /* Todo List */
    .todo-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .todo-item {
      position: relative;
    }
    
    .item-glow {
      position: absolute;
      top: -10px; left: -10px; right: -10px; bottom: -10px;
      filter: blur(20px);
      border-radius: 30px;
      opacity: 0;
      transition: opacity 0.3s;
      pointer-events: none;
      z-index: 0;
    }
    
    .todo-item:hover .item-glow {
      opacity: 0.5;
    }
    
    .glow-blue { background: rgba(34, 211, 238, 0.2); }
    .glow-green { background: rgba(52, 211, 153, 0.2); }
    
    .item-content {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 1.25rem 1.5rem;
      border-radius: 16px;
      background: rgba(24, 24, 27, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.05);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .todo-item:hover .item-content {
      transform: translateY(-2px);
      background: rgba(39, 39, 42, 0.6);
      border-color: rgba(255, 255, 255, 0.1);
    }
    
    .todo-item.completed .item-content {
      opacity: 0.7;
      background: rgba(24, 24, 27, 0.2);
    }
    
    /* Custom Checkbox */
    .custom-checkbox {
      position: relative;
      display: block;
      width: 24px;
      height: 24px;
      cursor: pointer;
      user-select: none;
    }
    
    .custom-checkbox input {
      position: absolute;
      opacity: 0;
      cursor: pointer;
      height: 0;
      width: 0;
    }
    
    .checkmark {
      position: absolute;
      top: 0; left: 0;
      height: 24px; width: 24px;
      background-color: rgba(255, 255, 255, 0.05);
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 6px;
      transition: all 0.2s ease;
    }
    
    .todo-item:hover .checkmark {
      border-color: var(--accent-cyan);
    }
    
    .custom-checkbox input:checked ~ .checkmark {
      background-color: var(--accent-cyan);
      border-color: var(--accent-cyan);
      box-shadow: 0 0 10px rgba(34, 211, 238, 0.5);
    }
    
    .checkmark:after {
      content: "";
      position: absolute;
      display: none;
      left: 7px;
      top: 3px;
      width: 5px;
      height: 10px;
      border: solid #09090b;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
    
    .custom-checkbox input:checked ~ .checkmark:after {
      display: block;
    }
    
    /* Item Details */
    .todo-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      min-width: 0;
    }
    
    .todo-text {
      font-size: 1.1rem;
      color: var(--text-primary);
      font-weight: 500;
      word-break: break-word;
      transition: color 0.3s;
    }
    
    .todo-item.completed .todo-text {
      color: var(--text-secondary);
      text-decoration: line-through;
      text-decoration-color: var(--accent-pink);
    }
    
    .todo-time {
      font-size: 0.8rem;
      color: var(--text-secondary);
      opacity: 0.7;
    }
    
    /* Delete Button */
    .delete-btn {
      background: transparent;
      border: none;
      color: var(--text-secondary);
      width: 40px; height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      opacity: 0.5;
    }
    
    .todo-item:hover .delete-btn {
      opacity: 1;
    }
    
    .delete-btn:hover {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }
    
    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: rgba(24, 24, 27, 0.3);
      border-radius: 20px;
      border: 1px dashed rgba(255, 255, 255, 0.1);
    }
    
    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      filter: drop-shadow(0 0 20px rgba(34, 211, 238, 0.4));
    }
    
    .empty-state h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
      color: var(--text-primary);
    }
    
    .empty-state p {
      margin: 0;
      color: var(--text-secondary);
    }
    
    /* Actions */
    .todo-actions {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-top: 1rem;
    }
    
    .action-btn {
      padding: 0.75rem 1.5rem;
      border-radius: 12px;
      font-weight: 600;
    }
    
    @media (max-width: 640px) {
      .todo-header {
        padding: 1.5rem;
      }
      .add-todo {
        flex-direction: column;
      }
      .todo-actions {
        flex-direction: column;
      }
      .action-btn {
        width: 100%;
      }
    }
  `]
})
export class TodoComponent implements OnInit {
  todos = signal<TodoItem[]>([]);
  newTodoText = '';
  
  // Derived state using computed signals (highly reactive and efficient)
  completedCount = computed(() => this.todos().filter(t => t.completed).length);
  
  progressPercentage = computed(() => {
    const total = this.todos().length;
    if (total === 0) return 0;
    return (this.completedCount() / total) * 100;
  });

  ngOnInit(): void {
    const todosString = localStorage.getItem('todos');
    if (todosString) {
      try {
        const savedTodos = JSON.parse(todosString);
        this.todos.set(savedTodos);
      } catch (error) {
        console.error('Error loading todos from localStorage:', error);
        this.todos.set([]);
      }
    }
  }

  addTodo() {
    if (this.newTodoText.trim()) {
      const newTodo: TodoItem = {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(), // Bulletproof unique ID
        text: this.newTodoText.trim(),
        completed: false,
        createdAt: Date.now() // Standard timestamp
      };
      this.todos.update(todos => [newTodo, ...todos]); // Add to top of list
      this.updateLocalStorage();
      this.newTodoText = '';
    }
  }

  toggleTodo(id: string) {
    this.todos.update(todos =>
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
    this.updateLocalStorage();
  }

  deleteTodo(id: string) {
    this.todos.update(todos => todos.filter(todo => todo.id !== id));
    this.updateLocalStorage();
  }

  clearCompleted() {
    this.todos.update(todos => todos.filter(todo => !todo.completed));
    this.updateLocalStorage();
  }

  clearAll() {
    if (confirm('Are you sure you want to delete all tasks?')) {
      this.todos.set([]);
      this.updateLocalStorage();
    }
  }

  private updateLocalStorage() {
    try {
      localStorage.setItem('todos', JSON.stringify(this.todos()));
    } catch (error) {
      console.error('Error saving todos to localStorage:', error);
    }
  }

  trackByFn(index: number, item: TodoItem): string {
    return item.id;
  }

  formatDate(timestamp: number): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  }
}
