import type { TodoItem } from '../../types';
import { uuid } from '../../../common/tunnel/utils';

export class TodoManager {
  private todos: TodoItem[] = [];
  private callbacks: Array<(todos: TodoItem[]) => void> = [];

  onChange(callback: (todos: TodoItem[]) => void): () => void {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter((cb) => cb !== callback);
    };
  }

  private notifyChange(): void {
    const snapshot = this.listTodos();
    this.callbacks.forEach((cb) => cb(snapshot));
  }

  addTodo(
    description: string,
    priority: 'high' | 'medium' | 'low' = 'medium',
    parentId?: string
  ): TodoItem {
    const todo: TodoItem = {
      id: uuid('todo-'),
      parentId,
      description,
      status: 'pending',
      priority,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.todos.push(todo);
    this.notifyChange();

    return todo;
  }

  updateTodo(
    id: string,
    updates: Partial<Pick<TodoItem, 'status' | 'description'>>
  ): void {
    const todo = this.todos.find((t) => t.id === id);
    if (!todo) {
      throw new Error(`Todo not found: ${id}`);
    }

    Object.assign(todo, updates, { updatedAt: Date.now() });
    this.notifyChange();
  }

  listTodos(): TodoItem[] {
    return [...this.todos];
  }

  getProgress(): { completed: number; total: number; percentage: number } {
    const total = this.todos.length;
    const completed = this.todos.filter((t) => t.status === 'completed').length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;

    return { completed, total, percentage };
  }

  isAllCompleted(): boolean {
    if (this.todos.length === 0) return true;
    return this.todos.every((t) => t.status === 'completed');
  }

  clear(): void {
    this.todos = [];
    this.notifyChange();
  }
}
