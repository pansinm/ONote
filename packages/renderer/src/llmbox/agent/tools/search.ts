import type { Tool } from '../../types';

export function createSearchTools(): Tool[] {
  return [
    {
      name: 'searchInFile',
      description: '在文件中搜索内容。使用正则表达式模式搜索文件内容，返回匹配的行号和内容。',
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
      executor: async (_params) => {
        throw new Error('searchInFile is deprecated, use searchFiles instead');
      },
      metadata: { category: 'search', permission: 'read' },
    },
  ];
}
