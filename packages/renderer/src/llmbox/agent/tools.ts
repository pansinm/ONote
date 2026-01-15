import type { Tool, TodoItem, ToolParameter } from '../types';
import { channel, type Channel } from '../ipc';
import { z } from 'zod';
import { LLM_BOX_MESSAGE_TYPES } from '../utils/constants';

// ============================================================================
// Zod 验证 Schema
// ============================================================================

const readFileSchema = z.object({
  uri: z.string().min(1, 'URI is required'),
});

const writeFileSchema = z.object({
  uri: z.string().min(1, 'URI is required'),
  content: z.string(),
});

const replaceFileSchema = z.object({
  uri: z.string().min(1, 'URI is required'),
  operations: z.array(
    z.object({
      mode: z.enum(['string', 'regex', 'line_range', 'line_number']),
      search: z.string().min(1, 'Search content cannot be empty'),
      replace: z.string(),
      replaceAll: z.boolean().optional(),
      caseSensitive: z.boolean().optional(),
      lineStart: z.number().optional(),
      lineEnd: z.number().optional(),
    }),
  ),
  preview: z.boolean().optional(),
});

const createFileSchema = z.object({
  uri: z.string().min(1, 'URI is required'),
  content: z.string().optional().default(''),
});

const deleteFileSchema = z.object({
  uri: z.string().min(1, 'URI is required'),
});

const listFilesSchema = z.object({
  uri: z.string().min(1, 'URI is required'),
});

const searchFilesSchema = z.object({
  rootUri: z.string().min(1, 'Root URI is required'),
  keywords: z.string().min(1, 'Keywords is required'),
});

const searchInFileSchema = z.object({
  uri: z.string().min(1, 'URI is required'),
  pattern: z.string().min(1, 'Pattern is required'),
});

const createTodoSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  priority: z.enum(['high', 'medium', 'low']).optional().default('medium'),
  parentId: z.string().optional(),
});

const updateTodoSchema = z.object({
  id: z.string().min(1, 'Todo ID is required'),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'failed']).optional(),
});

// ============================================================================
// 工具创建函数
// ============================================================================

function createValidatedTool<T>(tool: Tool, schema: z.ZodSchema<T>): Tool {
  return {
    ...tool,
    executor: async (params) => {
      const result = schema.safeParse(params);
      if (!result.success) {
        const errors = result.error.issues.map((e) => e.message).join(', ');
        throw new Error(`Invalid parameters: ${errors}`);
      }
      return tool.executor(result.data as Record<string, unknown>);
    },
  };
}

export function createFileTools(channel: Channel): Tool[] {
  const tools: Tool[] = [
    {
      name: 'readFile',
      description:
        '读取文件内容。支持所有文本文件格式。如果 Context 中已提供当前文件内容，优先使用 Context，无需调用此工具。',
      parameters: {
        type: 'object',
        properties: {
          uri: {
            type: 'string',
            description:
              '文件 URI，必须是完整路径，例如 file:///path/to/file.md',
          },
        },
        required: ['uri'],
      },
      executor: async (params) => {
        const response = await channel.send({
          type: LLM_BOX_MESSAGE_TYPES.AGENT_FILE_READ,
          data: params,
        });
        if (response.error) {
          throw new Error(String(response.error));
        }
        return response.content;
      },
      metadata: { category: 'file', permission: 'read' },
    },
    {
      name: 'writeFile',
      description: '写入文件内容。会覆盖文件的现有内容。默认写入当前文件。',
      parameters: {
        type: 'object',
        properties: {
          uri: { type: 'string', description: '文件 URI，必须是完整路径' },
          content: { type: 'string', description: '要写入文件的内容' },
        },
        required: ['uri', 'content'],
      },
      executor: async (params) => {
        const response = await channel.send({
          type: LLM_BOX_MESSAGE_TYPES.AGENT_FILE_WRITE,
          data: params,
        });
        if (response.error) throw new Error(String(response.error));
        return response;
      },
      metadata: { category: 'file', permission: 'write', dangerous: true },
    },
    {
      name: 'replaceFileContent',
      description: '替换文件中的部分内容。适用于局部修改、bug 修复、代码重构。',
      parameters: {
        type: 'object',
        properties: {
          uri: { type: 'string', description: '文件 URI，必须是完整路径' },
          operations: {
            type: 'array',
            description: '替换操作列表',
            items: {
              type: 'object',
              properties: {
                mode: {
                  type: 'string',
                  description: '替换模式',
                  enum: ['string', 'regex', 'line_range', 'line_number'],
                },
                search: { type: 'string', description: '搜索内容' },
                replace: { type: 'string', description: '替换内容' },
              },
              required: ['mode', 'search', 'replace'],
            } as unknown as ToolParameter,
          } as unknown as ToolParameter,
        },
        required: ['uri', 'operations'],
      },
      executor: async (params) => {
        const response = await channel.send({
          type: LLM_BOX_MESSAGE_TYPES.AGENT_FILE_REPLACE,
          data: params,
        });
        if (response.error) throw new Error(String(response.error));
        return response;
      },
      metadata: { category: 'file', permission: 'write', dangerous: true },
    },
    {
      name: 'createFile',
      description: '创建新文件。如果文件已存在，会提示错误。',
      parameters: {
        type: 'object',
        properties: {
          uri: { type: 'string', description: '文件 URI，必须是完整路径' },
          content: { type: 'string', description: '文件的初始内容' },
        },
        required: ['uri'],
      },
      executor: async (params) => {
        const response = await channel.send({
          type: LLM_BOX_MESSAGE_TYPES.AGENT_FILE_CREATE,
          data: params,
        });
        if (response.error) throw new Error(String(response.error));
        return response;
      },
      metadata: { category: 'file', permission: 'write', dangerous: true },
    },
    {
      name: 'deleteFile',
      description: '永久删除文件。此操作不可逆，请谨慎使用。',
      parameters: {
        type: 'object',
        properties: {
          uri: { type: 'string', description: '文件 URI，必须是完整路径' },
        },
        required: ['uri'],
      },
      executor: async (params) => {
        const response = await channel.send({
          type: LLM_BOX_MESSAGE_TYPES.AGENT_FILE_DELETE,
          data: params,
        });
        if (response.error) throw new Error(String(response.error));
        return response;
      },
      metadata: { category: 'file', permission: 'write', dangerous: true },
    },
    {
      name: 'listFiles',
      description: '列出目录中的文件和子目录。',
      parameters: {
        type: 'object',
        properties: {
          uri: { type: 'string', description: '目录 URI，必须是完整路径' },
        },
        required: ['uri'],
      },
      executor: async (params) => {
        const response = await channel.send({
          type: LLM_BOX_MESSAGE_TYPES.AGENT_FILE_LIST,
          data: params,
        });
        if (response.error) throw new Error(String(response.error));
        return response.files;
      },
      metadata: { category: 'file', permission: 'read' },
    },
    {
      name: 'searchFiles',
      description: '根据关键词搜索文件。',
      parameters: {
        type: 'object',
        properties: {
          rootUri: { type: 'string', description: '搜索的根目录 URI' },
          keywords: { type: 'string', description: '要搜索的关键词' },
        },
        required: ['rootUri', 'keywords'],
      },
      executor: async (params) => {
        const response = await channel.send({
          type: LLM_BOX_MESSAGE_TYPES.AGENT_FILE_SEARCH,
          data: params,
        });
        if (response.error) throw new Error(String(response.error));
        return response.results;
      },
      metadata: { category: 'file', permission: 'read' },
    },
    {
      name: 'searchInFile',
      description: '在文件中搜索内容。使用正则表达式模式搜索文件内容。',
      parameters: {
        type: 'object',
        properties: {
          uri: { type: 'string', description: '文件 URI，必须是完整路径' },
          pattern: { type: 'string', description: '要搜索的模式' },
        },
        required: ['uri', 'pattern'],
      },
      executor: async (params) => {
        const response = await channel.send({
          type: LLM_BOX_MESSAGE_TYPES.AGENT_FILE_SEARCH_IN,
          data: params,
        });
        if (response.error) throw new Error(String(response.error));
        return { matches: response.matches, count: response.count };
      },
      metadata: { category: 'search', permission: 'read' },
    },
  ];

  // 添加验证
  const validationMap: Record<string, z.ZodSchema<unknown>> = {
    readFile: readFileSchema,
    writeFile: writeFileSchema,
    replaceFileContent: replaceFileSchema,
    createFile: createFileSchema,
    deleteFile: deleteFileSchema,
    listFiles: listFilesSchema,
    searchFiles: searchFilesSchema,
    searchInFile: searchInFileSchema,
  };

  return tools.map((tool) => {
    const schema = validationMap[tool.name];
    return schema ? createValidatedTool(tool, schema) : tool;
  });
}

// ============================================================================
// Todo 工具
// ============================================================================

export interface TodoManager {
  addTodo(
    description: string,
    priority?: 'high' | 'medium' | 'low',
    parentId?: string,
  ): TodoItem;
  updateTodo(
    id: string,
    updates: Partial<Pick<TodoItem, 'status' | 'description'>>,
  ): void;
  listTodos(): TodoItem[];
  getProgress(): { completed: number; total: number; percentage: number };
  isAllCompleted(): boolean;
  clear(): void;
  onChange(callback: (todos: TodoItem[]) => void): () => void;
}

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
    parentId?: string,
  ): TodoItem {
    const todo: TodoItem = {
      id: crypto.randomUUID(),
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
    updates: Partial<Pick<TodoItem, 'status' | 'description'>>,
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

export function createTodoTools(todoManager: TodoManager): Tool[] {
  return [
    {
      name: 'createTodo',
      description:
        '创建新的待办任务项。必须提供 description 参数（任务的具体描述）。用于将复杂任务分解为可执行的子任务。参数说明：description (必需) - 任务的详细描述；priority (可选) - 优先级，可选值为 high/medium/low，默认为 medium；parentId (可选) - 父任务 ID，用于创建子任务。',
      parameters: {
        type: 'object',
        properties: {
          description: {
            type: 'string',
            description:
              '必需参数。任务的具体描述，例如：实现用户登录功能、修复页面样式 bug 等',
          },
          priority: {
            type: 'string',
            enum: ['high', 'medium', 'low'],
            description:
              '可选参数。任务优先级：high(高)、medium(中)、low(低)，默认为 medium',
          },
          parentId: {
            type: 'string',
            description: '可选参数。父任务的 ID，如果提供则创建为子任务',
          },
        },
        required: ['description'],
      },
      executor: async (params) => {
        const result = createTodoSchema.safeParse(params);
        if (!result.success) {
          const errorDetails = result.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
            received:
              params[issue.path[0] as keyof typeof params] ?? 'undefined',
            expected: issue.code,
          }));
          throw new Error(
            `Invalid parameters for createTodo: ${JSON.stringify(
              errorDetails,
            )}。提示：description 参数是必需的，请确保提供了任务描述。`,
          );
        }
        return todoManager.addTodo(
          result.data.description,
          result.data.priority,
          result.data.parentId,
        );
      },
      metadata: { category: 'custom', permission: 'write' },
    },
    {
      name: 'updateTodo',
      description: '更新任务状态或描述。',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: '任务 ID' },
          status: {
            type: 'string',
            description: '任务状态',
            enum: ['pending', 'in_progress', 'completed', 'failed'],
          },
          description: { type: 'string', description: '新描述' },
        },
        required: ['id', 'status'],
      },
      executor: async (params) => {
        const result = updateTodoSchema.safeParse(params);
        if (!result.success) {
          const errorDetails = result.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          }));
          throw new Error(
            `Invalid parameters for updateTodo: ${JSON.stringify(
              errorDetails,
            )}`,
          );
        }
        todoManager.updateTodo(result.data.id, {
          status: result.data.status,
          description: result.data.description,
        });
        return todoManager.listTodos().find((t) => t.id === result.data.id);
      },
      metadata: { category: 'custom', permission: 'write' },
    },
    {
      name: 'listTodos',
      description: '列出所有任务项及其状态。',
      parameters: { type: 'object', properties: {} },
      executor: async () => {
        const todos = todoManager.listTodos();
        const progress = todoManager.getProgress();
        return { todos, progress };
      },
      metadata: { category: 'custom', permission: 'read' },
    },
  ];
}

// ============================================================================
// ToolRegistry
// ============================================================================

export class ToolRegistry {
  private tools = new Map<string, Tool>();

  constructor(todoManager?: TodoManager) {
    createFileTools(channel).forEach((tool) => this.tools.set(tool.name, tool));
    if (todoManager) {
      createTodoTools(todoManager).forEach((tool) =>
        this.tools.set(tool.name, tool),
      );
    }
  }

  getAll(): Tool[] {
    return Array.from(this.tools.values());
  }

  get(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  getOpenAISchema(): Array<{
    type: string;
    function: {
      name: string;
      description: string;
      parameters: Record<string, unknown>;
    };
  }> {
    return Array.from(this.tools.values()).map((tool) => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters as Record<string, unknown>,
      },
    }));
  }
}
