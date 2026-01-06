import type { Tool } from './types';
import { getLogger } from '../../shared/logger';

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
      description: 'Read the content of a file',
      parameters: {
        type: 'object',
        properties: {
          uri: {
            type: 'string',
            description: 'The URI of file to read (e.g., file:///path/to/file.md)',
          },
        },
        required: ['uri'],
      },
      metadata: { category: 'file', permission: 'read' },
      executor: async (params) => {
        const response = await this.channel.send({
          type: 'AGENT_FILE_READ',
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
      description: 'Write content to a file (overwrites existing content)',
      parameters: {
        type: 'object',
        properties: {
          uri: {
            type: 'string',
            description: 'The URI of the file to write',
          },
          content: {
            type: 'string',
            description: 'The content to write to the file',
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
          type: 'AGENT_FILE_WRITE',
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
      description: 'Create a new file with content',
      parameters: {
        type: 'object',
        properties: {
          uri: {
            type: 'string',
            description: 'The URI where the file should be created',
          },
          content: {
            type: 'string',
            description: 'The initial content of the file',
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
          type: 'AGENT_FILE_CREATE',
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
      description: 'Delete a file permanently',
      parameters: {
        type: 'object',
        properties: {
          uri: {
            type: 'string',
            description: 'The URI of the file to delete',
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
          type: 'AGENT_FILE_DELETE',
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
      description: 'List files and directories in a directory',
      parameters: {
        type: 'object',
        properties: {
          uri: {
            type: 'string',
            description: 'The URI of the directory to list',
          },
        },
        required: ['uri'],
      },
      metadata: { category: 'file', permission: 'read' },
      executor: async (params) => {
        const response = await this.channel.send({
          type: 'AGENT_FILE_LIST',
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
      description: 'Search for files by keywords in file names',
      parameters: {
        type: 'object',
        properties: {
          rootUri: {
            type: 'string',
            description: 'The root URI to search in',
          },
          keywords: {
            type: 'string',
            description: 'Keywords to search for',
          },
        },
        required: ['rootUri', 'keywords'],
      },
      metadata: { category: 'file', permission: 'read' },
      executor: async (params) => {
        const response = await this.channel.send({
          type: 'AGENT_FILE_SEARCH',
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
      description: 'Search for a pattern within a file',
      parameters: {
        type: 'object',
        properties: {
          uri: {
            type: 'string',
            description: 'The URI of the file to search in',
          },
          pattern: {
            type: 'string',
            description: 'The pattern to search for (supports regex)',
          },
        },
        required: ['uri', 'pattern'],
      },
      metadata: { category: 'search', permission: 'read' },
      executor: async (params) => {
        const response = await this.channel.send({
          type: 'AGENT_FILE_SEARCH_IN',
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
