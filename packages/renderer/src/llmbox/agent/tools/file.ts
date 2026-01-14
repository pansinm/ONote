import type { Tool, ToolParameter } from '../../types';
import type { LLMBoxMessageType } from '../../constants/LLMBoxConstants';
import type { Channel } from '../../ipc';

export function createFileTools(channel: Channel): Tool[] {
  return [
    {
      name: 'readFile',
      description: '读取文件内容。支持所有文本文件格式。如果 Context 中已提供当前文件内容，优先使用 Context，无需调用此工具。',
      parameters: {
        type: 'object',
        properties: {
          uri: {
            type: 'string',
            description: '文件 URI，必须是完整路径，例如 file:///path/to/file.md',
          },
        },
        required: ['uri'],
      },
      executor: async (params) => {
        const response = await channel.send({
          type: 'AGENT_FILE_READ' as LLMBoxMessageType,
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
          uri: {
            type: 'string',
            description: '文件 URI，必须是完整路径',
          },
          content: {
            type: 'string',
            description: '要写入文件的内容',
          },
        },
        required: ['uri', 'content'],
      },
      executor: async (params) => {
        const response = await channel.send({
          type: 'AGENT_FILE_WRITE' as LLMBoxMessageType,
          data: params,
        });

        if (response.error) {
          throw new Error(String(response.error));
        }

        return response;
      },
      metadata: { category: 'file', permission: 'write', dangerous: true },
    },
    {
      name: 'replaceFileContent',
      description: '替换文件中的部分内容。适用于局部修改、bug 修复、代码重构。支持多种模式：string=字符串替换, regex=正则替换, line_range=行范围替换, line_number=单行替换。',
      parameters: {
        type: 'object',
        properties: {
          uri: {
            type: 'string',
            description: '文件 URI，必须是完整路径',
          },
          operations: {
            type: 'array',
            description: '替换操作列表',
            items: {
              type: 'object',
              description: '单个替换操作的详细配置',
              properties: {
                mode: {
                  type: 'string',
                  enum: ['string', 'regex', 'line_range', 'line_number'],
                  description: '替换模式',
                },
                search: {
                  type: 'string',
                  description: '搜索内容，注意 search 不能为空字符串',
                },
                replace: {
                  type: 'string',
                  description: '替换内容',
                },
                replaceAll: {
                  type: 'boolean',
                  description: '是否替换所有匹配项（仅 string 模式有效）',
                },
                caseSensitive: {
                  type: 'boolean',
                  description: '是否区分大小写（仅 string 模式有效）',
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
            } as unknown as ToolParameter,
          },
          preview: {
            type: 'boolean',
            description: '是否只预览修改结果而不实际写入',
          },
        },
        required: ['uri', 'operations'],
      },
      executor: async (params) => {
        const response = await channel.send({
          type: 'AGENT_FILE_REPLACE' as LLMBoxMessageType,
          data: params,
        });

        if (response.error) {
          throw new Error(String(response.error));
        }

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
          uri: {
            type: 'string',
            description: '文件 URI，必须是完整路径',
          },
          content: {
            type: 'string',
            description: '文件的初始内容，默认为空字符串',
            default: '',
          },
        },
        required: ['uri'],
      },
      executor: async (params) => {
        const response = await channel.send({
          type: 'AGENT_FILE_CREATE' as LLMBoxMessageType,
          data: params,
        });

        if (response.error) {
          throw new Error(String(response.error));
        }

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
          uri: {
            type: 'string',
            description: '文件 URI，必须是完整路径',
          },
        },
        required: ['uri'],
      },
      executor: async (params) => {
        const response = await channel.send({
          type: 'AGENT_FILE_DELETE' as LLMBoxMessageType,
          data: params,
        });

        if (response.error) {
          throw new Error(String(response.error));
        }

        return response;
      },
      metadata: { category: 'file', permission: 'write', dangerous: true },
    },
    {
      name: 'listFiles',
      description: '列出目录中的文件和子目录。默认列出当前文件所在目录。',
      parameters: {
        type: 'object',
        properties: {
          uri: {
            type: 'string',
            description: '目录 URI，必须是完整路径',
          },
        },
        required: ['uri'],
      },
      executor: async (params) => {
        const response = await channel.send({
          type: 'AGENT_FILE_LIST' as LLMBoxMessageType,
          data: params,
        });

        if (response.error) {
          throw new Error(String(response.error));
        }

        return response.files;
      },
      metadata: { category: 'file', permission: 'read' },
    },
    {
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
      executor: async (params) => {
        const response = await channel.send({
          type: 'AGENT_FILE_SEARCH' as LLMBoxMessageType,
          data: params,
        });

        if (response.error) {
          throw new Error(String(response.error));
        }

        return response.results;
      },
      metadata: { category: 'file', permission: 'read' },
    },
    {
      name: 'searchInFile',
      description: '在文件中搜索内容。使用正则表达式模式搜索文件内容，返回匹配的行号和内容。默认在当前文件中搜索。',
      parameters: {
        type: 'object',
        properties: {
          uri: {
            type: 'string',
            description: '文件 URI，必须是完整路径',
          },
          pattern: {
            type: 'string',
            description: '要搜索的模式，支持正则表达式',
          },
        },
        required: ['uri', 'pattern'],
      },
      executor: async (params) => {
        const response = await channel.send({
          type: 'AGENT_FILE_SEARCH_IN' as LLMBoxMessageType,
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
      metadata: { category: 'search', permission: 'read' },
    },
  ];
}
