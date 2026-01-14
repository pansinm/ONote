import type { Tool } from '../../types';
import type { TodoItem } from '../../types';

export interface TodoManager {
  addTodo: (description: string, priority: 'high' | 'medium' | 'low', parentId?: string) => TodoItem;
  updateTodo: (id: string, updates: Partial<Pick<TodoItem, 'status' | 'description'>>) => void;
  listTodos: () => TodoItem[];
  getProgress: () => { completed: number; total: number; percentage: number };
}

export function createTodoTools(todoManager: TodoManager): Tool[] {
  return [
    {
      name: 'createTodo',
      description: '创建新的任务项。用于分解复杂任务为可执行的子任务。参数 description 是必需的，必须提供任务的具体描述。可以指定父任务 ID 来创建子任务。',
      parameters: {
        type: 'object',
        properties: {
          description: {
            type: 'string',
            description: '任务描述（必需）：具体要完成的任务内容',
          },
          priority: {
            type: 'string',
            enum: ['high', 'medium', 'low'],
            description: '优先级：high(高)、medium(中)、low(低)，默认为 medium',
          },
          parentId: {
            type: 'string',
            description: '父任务 ID（可选）：如果提供，将创建为该任务的子任务',
          },
        },
        required: ['description'],
      },
      executor: async (params) => {
        const priority = (params.priority as 'high' | 'medium' | 'low') || 'medium';
        const todo = todoManager.addTodo(
          String(params.description),
          priority,
          params.parentId ? String(params.parentId) : undefined
        );
        return todo;
      },
      metadata: { category: 'custom', permission: 'write' },
    },
    {
      name: 'updateTodo',
      description: '更新任务状态或描述。id 和 status 是必需参数。',
      parameters: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: '任务 ID（必需）：要更新的任务标识符',
          },
          status: {
            type: 'string',
            enum: ['in_progress', 'completed', 'failed'],
            description: '新状态（必需）：in_progress(进行中)、completed(已完成)、failed(失败)',
          },
          description: {
            type: 'string',
            description: '新描述（可选）：更新后的任务描述',
          },
        },
        required: ['id', 'status'],
      },
      executor: async (params) => {
        const status = params.status as 'pending' | 'in_progress' | 'completed' | 'failed' | undefined;
        todoManager.updateTodo(String(params.id), { status });
        const todos = todoManager.listTodos();
        return todos.find((t) => t.id === String(params.id));
      },
      metadata: { category: 'custom', permission: 'write' },
    },
    {
      name: 'listTodos',
      description: '列出所有任务项及其状态。用于查看当前任务进度。',
      parameters: {
        type: 'object',
        properties: {},
      },
      executor: async () => {
        const todos = todoManager.listTodos();
        const progress = todoManager.getProgress();
        return { todos, progress };
      },
      metadata: { category: 'custom', permission: 'read' },
    },
  ];
}
