import type { Tool } from './types';
import { getLogger } from '../../shared/logger';
import {
  LLM_BOX_MESSAGE_TYPES,
  type LLMBoxMessageType,
} from '../constants/LLMBoxConstants';
import type TodoManager from './TodoManager';

const logger = getLogger('ToolRegistry');

interface Channel {
  send: (message: { type: LLMBoxMessageType; data: unknown }) => Promise<Record<string, unknown>>;
}

class ToolRegistry {
  private tools: Map<string, Tool> = new Map();
  private channel: Channel;
  private todoManager?: TodoManager;

  constructor(channel: Channel, todoManager?: TodoManager) {
    this.channel = channel;
    this.todoManager = todoManager;
    this.initializeBuiltInTools();
  }

  /**
   * 注册工具
   */
  register(tool: Tool): void {
    this.tools.set(tool.name, tool);
    logger.info('Tool registered', { name: tool.name });
  }

  /**
   * 获取所有工具
   */
  getAll(): Tool[] {
    return Array.from(this.tools.values());
  }

  /**
   * 获取工具
   */
  get(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  /**
   * 获取 OpenAI 格式的工具 Schema
   */
  getOpenAISchema(): any[] {
    return Array.from(this.tools.values()).map(tool => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    }));
  }

  /**
   * 初始化内置工具
   */
  private initializeBuiltInTools(): void {
    this.register({
      name: 'readFile',
      description: '读取文件内容。支持所有文本文件格式（.md, .txt, .js, .ts 等）。注意：如果 Context 中已提供当前文件内容（Current File Content），优先使用 Context 中的内容，无需调用此工具。仅在需要读取其他文件时使用。',
      parameters: {
        type: 'object',
        properties: {
          uri: {
            type: 'string',
            description: '要读取的文件 URI，必须是完整路径。如果用户未指定，默认使用当前文件（Current File）的 URI，例如：file:///Users/username/notes/file.md',
          },
        },
        required: ['uri'],
      },
      metadata: { category: 'file', permission: 'read' },
      executor: async (params) => {
        const response = await this.channel.send({
          type: LLM_BOX_MESSAGE_TYPES.AGENT_FILE_READ,
          data: params,
        });
        
        if (response.error) {
          throw new Error(String(response.error));
        }
        
        return response.content;
      },
    });

    // 写入文件
    this.register({
      name: 'writeFile',
      description: '写入文件内容。会覆盖文件的现有内容，用于更新或修改文件。默认写入当前文件（Current File）。',
      parameters: {
        type: 'object',
        properties: {
          uri: {
            type: 'string',
            description: '要写入的文件 URI，必须是完整路径。如果用户未指定，默认使用当前文件（Current File）的 URI',
          },
          content: {
            type: 'string',
            description: '要写入文件的内容',
          },
        },
        required: ['uri', 'content'],
      },
      metadata: {
        category: 'file',
        permission: 'write',
        dangerous: true,
      },
      executor: async (params) => {
        const response = await this.channel.send({
          type: LLM_BOX_MESSAGE_TYPES.AGENT_FILE_WRITE,
          data: params,
        });

        if (response.error) {
          throw new Error(String(response.error));
        }

        return response;
      },
    });

    // 替换文件内容
    this.register({
      name: 'replaceFileContent',
      description: '替换文件中的部分内容。适用于局部修改、bug 修复、代码重构等场景，避免全量输出文件内容，节省 token。支持多种替换模式：string=字符串替换, regex=正则表达式替换, line_range=行范围替换, line_number=单行替换。可以执行多个替换操作。',
      parameters: {
        type: 'object',
        properties: {
          uri: {
            type: 'string',
            description: '要修改的文件 URI，必须是完整路径。如果用户未指定，默认使用当前文件（Current File）的 URI',
          },
          operations: {
            type: 'array',
            description: '替换操作列表，支持多个替换操作',
            items: {
              type: 'object',
              description: '单个替换操作的详细配置',
              properties: {
                mode: {
                  type: 'string',
                  enum: ['string', 'regex', 'line_range', 'line_number'],
                  description: '替换模式：string=字符串替换, regex=正则表达式替换, line_range=行范围替换, line_number=单行替换',
                },
                search: {
                  type: 'string',
                  description: '搜索内容（string/regex/line_number 模式）或行号（line_number 模式时为数字，但类型定义为 string）。注意：search 不能为空字符串',
                },
                replace: {
                  type: 'string',
                  description: '替换内容',
                },
                replaceAll: {
                  type: 'boolean',
                  description: '是否替换所有匹配项（仅 string 模式有效），默认 false',
                  default: false,
                },
                caseSensitive: {
                  type: 'boolean',
                  description: '是否区分大小写（仅 string 模式有效），默认 false',
                  default: false,
                },
                lineStart: {
                  type: 'number',
                  description: '起始行号（仅 line_range 模式有效）',
                },
                lineEnd: {
                  type: 'number',
                  description: '结束行号（仅 line_range 模式有效）',
                },
              },
              required: ['mode', 'search', 'replace'],
            },
          },
          preview: {
            type: 'boolean',
            description: '是否只预览修改结果而不实际写入，默认 false。预览模式下会返回修改后的内容，但不会保存到文件',
            default: false,
          },
        },
        required: ['uri', 'operations'],
      },
      metadata: {
        category: 'file',
        permission: 'write',
        dangerous: true,
      },
      executor: async (params) => {
        const response = await this.channel.send({
          type: LLM_BOX_MESSAGE_TYPES.AGENT_FILE_REPLACE,
          data: params,
        });

        if (response.error) {
          throw new Error(String(response.error));
        }

        return response;
      },
    });

    // 创建文件
    this.register({
      name: 'createFile',
      description: '创建新文件。如果文件已存在，会提示错误。',
      parameters: {
        type: 'object',
        properties: {
          uri: {
            type: 'string',
            description: '要创建的文件 URI，必须是完整路径',
          },
          content: {
            type: 'string',
            description: '文件的初始内容，默认为空字符串',
            default: '',
          },
        },
        required: ['uri'],
      },
      metadata: { 
        category: 'file', 
        permission: 'write',
        dangerous: true,
      },
      executor: async (params) => {
        const response = await this.channel.send({
          type: LLM_BOX_MESSAGE_TYPES.AGENT_FILE_CREATE,
          data: params,
        });
        
        if (response.error) {
          throw new Error(String(response.error));
        }
        
        return response;
      },
    });

    // 删除文件
    this.register({
      name: 'deleteFile',
      description: '永久删除文件。此操作不可逆，请谨慎使用。',
      parameters: {
        type: 'object',
        properties: {
          uri: {
            type: 'string',
            description: '要删除的文件 URI，必须是完整路径',
          },
        },
        required: ['uri'],
      },
      metadata: { 
        category: 'file', 
        permission: 'write',
        dangerous: true,
      },
      executor: async (params) => {
        const response = await this.channel.send({
          type: LLM_BOX_MESSAGE_TYPES.AGENT_FILE_DELETE,
          data: params,
        });
        
        if (response.error) {
          throw new Error(String(response.error));
        }
        
        return response;
      },
    });

    // 列出目录
    this.register({
      name: 'listFiles',
      description: '列出目录中的文件和子目录。默认列出当前文件所在目录（Working Directory），用于浏览文件结构。',
      parameters: {
        type: 'object',
        properties: {
          uri: {
            type: 'string',
            description: '要列出的目录 URI，必须是完整路径。如果用户未指定，默认使用当前文件所在目录（Working Directory）',
          },
        },
        required: ['uri'],
      },
      metadata: { category: 'file', permission: 'read' },
      executor: async (params) => {
        const response = await this.channel.send({
          type: LLM_BOX_MESSAGE_TYPES.AGENT_FILE_LIST,
          data: params,
        });
        
        if (response.error) {
          throw new Error(String(response.error));
        }
        
        return response.files;
      },
    });

    // 搜索文件
    this.register({
      name: 'searchFiles',
      description: '根据关键词搜索文件。在指定目录及其子目录中搜索文件名包含关键词的文件。',
      parameters: {
        type: 'object',
        properties: {
          rootUri: {
            type: 'string',
            description: '搜索的根目录 URI',
          },
          keywords: {
            type: 'string',
            description: '要搜索的关键词',
          },
        },
        required: ['rootUri', 'keywords'],
      },
      metadata: { category: 'file', permission: 'read' },
      executor: async (params) => {
        const response = await this.channel.send({
          type: LLM_BOX_MESSAGE_TYPES.AGENT_FILE_SEARCH,
          data: params,
        });
        
        if (response.error) {
          throw new Error(String(response.error));
        }
        
        return response.results;
      },
    });

    // 搜索文件内容
    this.register({
      name: 'searchInFile',
      description: '在文件中搜索内容。使用正则表达式模式搜索文件内容，返回匹配的行号和内容。默认在当前文件（Current File）中搜索。',
      parameters: {
        type: 'object',
        properties: {
          uri: {
            type: 'string',
            description: '要搜索的文件 URI，必须是完整路径。如果用户未指定，默认使用当前文件（Current File）的 URI',
          },
          pattern: {
            type: 'string',
            description: '要搜索的模式，支持正则表达式',
          },
        },
        required: ['uri', 'pattern'],
      },
      metadata: { category: 'search', permission: 'read' },
      executor: async (params) => {
        const response = await this.channel.send({
          type: LLM_BOX_MESSAGE_TYPES.AGENT_FILE_SEARCH_IN,
          data: params,
        });
        
        if (response.error) {
          throw new Error(String(response.error));
        }
        
        return {
          matches: response.matches,
          count: response.count,
        };
      },
    });

    if (this.todoManager) {
      this.initializeTodoTools();
    }

    logger.info('Built-in tools initialized', { count: this.tools.size });
  }

  private initializeTodoTools(): void {
    this.register({
      name: 'createTodo',
      description: '创建新的任务项。用于分解复杂任务为可执行的子任务。可以指定父任务 ID 来创建子任务，实现层级结构。',
      parameters: {
        type: 'object',
        properties: {
          description: {
            type: 'string',
            description: '任务描述',
          },
          priority: {
            type: 'string',
            enum: ['high', 'medium', 'low'],
            description: '优先级',
          },
          parentId: {
            type: 'string',
            description: '父任务 ID，可选。如果提供，将创建为子任务',
          },
        },
        required: ['description'],
      },
      metadata: { category: 'custom', permission: 'write' },
      executor: async (params) => {
        const priority = params.priority || 'medium';
        const todo = this.todoManager!.addTodo(
          String(params.description),
          priority as 'high' | 'medium' | 'low',
          params.parentId ? String(params.parentId) : undefined,
        );
        return todo;
      },
    });

    this.register({
      name: 'updateTodo',
      description: '更新任务状态。将任务标记为进行中或已完成。',
      parameters: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: '任务 ID',
          },
          status: {
            type: 'string',
            enum: ['in_progress', 'completed', 'failed'],
            description: '新状态',
          },
        },
        required: ['id', 'status'],
      },
      metadata: { category: 'custom', permission: 'write' },
      executor: async (params) => {
        this.todoManager!.updateTodo(String(params.id), { status: params.status as any });
        const todos = this.todoManager!.listTodos();
        return todos.find((t) => t.id === String(params.id));
      },
    });

    this.register({
      name: 'listTodos',
      description: '列出所有任务项及其状态。用于查看当前任务进度。',
      parameters: {
        type: 'object',
        properties: {},
      },
      metadata: { category: 'custom', permission: 'read' },
      executor: async () => {
        const todos = this.todoManager!.listTodos();
        const progress = this.todoManager!.getProgress();
        return {
          todos,
          progress,
        };
      },
    });
  }
}

export default ToolRegistry;
