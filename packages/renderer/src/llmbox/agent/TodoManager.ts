import { getLogger } from '../../shared/logger';
import { uuid } from '../../common/tunnel/utils';
import type { TodoItem, TodoStatus } from './types';

const logger = getLogger('TodoManager');

class TodoManager {
  private todos: TodoItem[] = [];
  private onTodoChange?: (todos: TodoItem[]) => void;

  registerCallback(callback: (todos: TodoItem[]) => void): void {
    this.onTodoChange = callback;
  }

  addTodo(description: string, priority: 'high' | 'medium' | 'low' = 'medium'): TodoItem {
    const todo: TodoItem = {
      id: uuid('todo-'),
      description,
      status: 'pending',
      priority,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.todos.push(todo);
    this.notifyChange();

    logger.info('Todo added', { id: todo.id, description, priority });
    return todo;
  }

  updateTodo(id: string, updates: Partial<Pick<TodoItem, 'status' | 'description'>>): void {
    const todo = this.todos.find((t) => t.id === id);
    if (!todo) {
      logger.warn('Todo not found', { id });
      throw new Error(`Todo not found: ${id}`);
    }

    Object.assign(todo, updates, { updatedAt: new Date() });
    this.notifyChange();

    logger.info('Todo updated', { id, updates });
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
    if (this.todos.length === 0) {
      return true;
    }
    return this.todos.every((t) => t.status === 'completed');
  }

  clear(): void {
    this.todos = [];
    this.notifyChange();

    logger.info('Todos cleared');
  }

  private notifyChange(): void {
    if (this.onTodoChange) {
      this.onTodoChange(this.listTodos());
    }
  }
}

export default TodoManager;
