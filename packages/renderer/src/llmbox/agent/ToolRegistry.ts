import type { Tool } from './types';
import { getLogger } from '../../shared/logger';
import { LLM_BOX_MESSAGE_TYPES } from '../constants/LLMBoxConstants';

const logger = getLogger('ToolRegistry');

/**
 * 工具注册表
 * 
 * 管理所有可用工具，提供工具查询和执行功能
 */
class ToolRegistry {
  private tools: Map<string, Tool> = new Map();
  private channel: any;

  constructor(channel: any) {
    this.channel = channel;
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
    // ========== 文件工具 ==========
    
    // 读取文件
    this.register({
      name: 'readFile',
      description: '读取文件内容。用于查看和分析文件，支持所有文本文件格式（.md, .txt, .js, .ts 等）。',
      parameters: {
        type: 'object',
        properties: {
          uri: {
            type: 'string',
            description: '要读取的文件 URI，必须是完整路径，例如：file:///Users/username/notes/file.md',
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
          throw new Error(response.error);
        }
        
        return response.content;
      },
    });

    // 写入文件
    this.register({
      name: 'writeFile',
      description: '写入文件内容。会覆盖文件的现有内容，用于更新或修改文件。',
      parameters: {
        type: 'object',
        properties: {
          uri: {
            type: 'string',
            description: '要写入的文件 URI，必须是完整路径',
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
          throw new Error(response.error);
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
          throw new Error(response.error);
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
          throw new Error(response.error);
        }
        
        return response;
      },
    });

    // 列出目录
    this.register({
      name: 'listFiles',
      description: '列出目录中的文件和子目录。用于浏览文件结构。',
      parameters: {
        type: 'object',
        properties: {
          uri: {
            type: 'string',
            description: '要列出的目录 URI，必须是完整路径',
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
          throw new Error(response.error);
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
          throw new Error(response.error);
        }
        
        return response.results;
      },
    });

    // 搜索文件内容
    this.register({
      name: 'searchInFile',
      description: '在文件中搜索内容。使用正则表达式模式搜索文件内容，返回匹配的行号和内容。',
      parameters: {
        type: 'object',
        properties: {
          uri: {
            type: 'string',
            description: '要搜索的文件 URI，必须是完整路径',
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
          throw new Error(response.error);
        }
        
        return {
          matches: response.matches,
          count: response.count,
        };
      },
    });

    logger.info('Built-in tools initialized', { count: this.tools.size });
  }
}

export default ToolRegistry;
