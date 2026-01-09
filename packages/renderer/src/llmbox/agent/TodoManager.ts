import { getLogger } from '../../shared/logger';
import { uuid } from '../../common/tunnel/utils';
import type { TodoItem } from './types';

const logger = getLogger('TodoManager');

class TodoManager {
  private todos: TodoItem[] = [];
  private onTodoChange?: (todos: TodoItem[]) => void;

  registerCallback(callback: (todos: TodoItem[]) => void): void {
    this.onTodoChange = callback;
  }

  addTodo(description: string, priority: 'high' | 'medium' | 'low' = 'medium', parentId?: string): TodoItem {
    const todo: TodoItem = {
      id: uuid('todo-'),
      parentId,
      description,
      status: 'pending',
      priority,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.todos.push(todo);
    this.notifyChange();

    logger.info('Todo added', { id: todo.id, description, priority, parentId });
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

  addSubTodo(parentId: string, description: string, priority: 'high' | 'medium' | 'low' = 'medium'): TodoItem {
    const parent = this.todos.find((t) => t.id === parentId);
    if (!parent) {
      logger.warn('Parent todo not found', { parentId });
      throw new Error(`Parent todo not found: ${parentId}`);
    }

    return this.addTodo(description, priority, parentId);
  }

  getTodoTree(): TodoItem[] {
    const flatTodos = this.listTodos();
    const todoMap = new Map<string, TodoItem>();
    const rootTodos: TodoItem[] = [];

    flatTodos.forEach((todo) => {
      todoMap.set(todo.id, { ...todo, children: [] });
    });

    const assignLevel = (todo: TodoItem, level: number): void => {
      todo.level = level;
      const children = flatTodos.filter((t) => t.parentId === todo.id);
      children.forEach((child) => {
        const childWithChildren = todoMap.get(child.id);
        if (childWithChildren) {
          assignLevel(childWithChildren, level + 1);
        }
      });
    };

    flatTodos.forEach((todo) => {
      const todoWithChildren = todoMap.get(todo.id);
      if (!todoWithChildren) return;

      if (todo.parentId) {
        const parent = todoMap.get(todo.parentId);
        if (parent) {
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(todoWithChildren);
        }
      } else {
        todoWithChildren.level = 0;
        rootTodos.push(todoWithChildren);
        assignLevel(todoWithChildren, 0);
      }
    });

    return rootTodos;
  }

  getTodoPath(todoId: string): TodoItem[] {
    const path: TodoItem[] = [];
    const visited = new Set<string>();
    let current = this.todos.find((t) => t.id === todoId);

    while (current) {
      if (visited.has(current.id)) {
        logger.error('Circular reference detected in todo tree', {
          todoId: current.id,
        });
        throw new Error(
          `Circular reference detected in todo tree: ${current.id}`,
        );
      }
      visited.add(current.id);

      path.unshift(current);
      if (!current.parentId) {
        break;
      }
      const parent = this.todos.find((t) => t.id === current.parentId);
      if (!parent) {
        break;
      }
      current = parent;
    }

    return path;
  }

  private notifyChange(): void {
    if (this.onTodoChange) {
      this.onTodoChange(this.listTodos());
    }
  }
}

export default TodoManager;
