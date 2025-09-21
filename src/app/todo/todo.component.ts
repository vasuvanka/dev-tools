import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
  createdAt: Date;
}

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="todo-container">
      <div class="todo-content glass-card">
        <div class="todo-header">
          <h1>📝 Todo List</h1>
          <div class="progress-section">
            <div class="progress-bar glass-medium">
              <div class="progress-fill" [style.width.%]="progressPercentage()"></div>
            </div>
            <span class="progress-text">{{ completedCount() }} / {{ todos().length }} completed</span>
          </div>
        </div>
        
        <div class="add-todo">
          <input 
            type="text" 
            [(ngModel)]="newTodoText" 
            placeholder="Add a new task..."
            (keyup.enter)="addTodo()"
            class="todo-input glass-input"
          >
          <button (click)="addTodo()" class="add-button glass-button" [disabled]="!newTodoText.trim()">
            Add
          </button>
        </div>
        
        <div class="todo-list">
          <div 
            *ngFor="let todo of todos(); trackBy: trackByFn" 
            class="todo-item glass-light"
            [class.completed]="todo.completed"
          >
            <input 
              type="checkbox" 
              [checked]="todo.completed"
              (change)="toggleTodo(todo.id)"
              class="todo-checkbox"
            >
            <span class="todo-text">{{ todo.text }}</span>
             <span class="todo-created-at" style="margin-left:auto; font-size:0.85em; color:var(--text-secondary);">
               {{ formatDate(todo.createdAt) }}
             </span>
             <button (click)="deleteTodo(todo.id)" class="delete-button glass-button">×</button>
          </div>
          
          <div *ngIf="todos().length === 0" class="empty-state glass-section">
            <p>No tasks yet. Add one above!</p>
          </div>
        </div>
        
        <div class="todo-actions" *ngIf="todos().length > 0">
          <button (click)="clearCompleted()" class="action-button glass-button" [disabled]="completedCount() === 0">
            Clear Completed
          </button>
          <button (click)="clearAll()" class="action-button glass-button danger">
            Clear All
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .todo-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    .todo-content {
      padding: 2rem;
    }
    
    .todo-header {
      margin-bottom: 2rem;
    }
    
    .todo-header h1 {
      margin: 0 0 1rem 0;
      color: var(--text-primary);
      font-size: 2rem;
    }
    
    .progress-section {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .progress-bar {
      flex: 1;
      height: 8px;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .progress-fill {
      height: 100%;
      background: var(--gradient-success);
      transition: width 0.3s ease;
    }
    
    .progress-text {
      font-weight: 600;
      color: var(--text-secondary);
      min-width: 120px;
    }
    
    .add-todo {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    
    .todo-input {
      flex: 1;
    }
    
    .add-button {
      padding: 0.75rem 1.5rem;
    }
    
    .todo-list {
      margin-bottom: 2rem;
    }
    
    .todo-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 0.5rem;
      transition: all 0.3s ease;
    }
    
    .todo-item:hover {
      transform: translateY(-2px);
      box-shadow: var(--glass-shadow-light);
    }
    
    .todo-item.completed {
      opacity: 0.6;
    }
    
    .todo-item.completed .todo-text {
      text-decoration: line-through;
    }
    
    .todo-checkbox {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }
    
    .todo-text {
      flex: 1;
      font-size: 1rem;
      color: var(--text-primary);
    }
    
    .delete-button {
      background: var(--gradient-danger);
      color: white;
      border: none;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      cursor: pointer;
      font-size: 1.2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }
    
    .delete-button:hover {
      transform: scale(1.1);
    }
    
    .empty-state {
      text-align: center;
      padding: 3rem;
      color: var(--text-secondary);
    }
    
    .todo-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }
    
    .action-button {
      padding: 0.5rem 1rem;
    }
    
    .action-button.danger {
      background: var(--gradient-danger);
      color: white;
    }
    
    .action-button.danger:hover:not(:disabled) {
      transform: translateY(-2px);
    }
  `]
})
export class TodoComponent implements OnInit {
  todos = signal<TodoItem[]>([]);
  newTodoText = '';
  private nextId = 1;

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
        id: this.nextId++,
        text: this.newTodoText.trim(),
        completed: false,
        createdAt: new Date()
      };
      this.todos.update(todos => [...todos, newTodo]);
      this.updateLocalStorage();
      this.newTodoText = '';
    }
  }

  toggleTodo(id: number) {
    this.todos.update(todos =>
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
    this.updateLocalStorage();
  }

  private updateLocalStorage() {
    try {
      localStorage.setItem('todos', JSON.stringify(this.todos()));
    } catch (error) {
      console.error('Error saving todos to localStorage:', error);
    }
  }

  deleteTodo(id: number) {
    this.todos.update(todos => todos.filter(todo => todo.id !== id));
    this.updateLocalStorage();
  }

  clearCompleted() {
    this.todos.update(todos => todos.filter(todo => !todo.completed));
    this.updateLocalStorage();
  }

  clearAll() {
    this.todos.set([]);
    this.updateLocalStorage();
  }

  completedCount() {
    return this.todos().filter(todo => todo.completed).length;
  }

  progressPercentage() {
    const total = this.todos().length;
    if (total === 0) return 0;
    return (this.completedCount() / total) * 100;
  }

  trackByFn(index: number, item: TodoItem) {
    return item.id;
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }
}
