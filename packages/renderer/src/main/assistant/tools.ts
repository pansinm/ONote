import { tool } from 'ai';
import { z } from 'zod';
const onote = (window as any).onote;

export const readFile = tool({
  description: 'Read file content from file URI',
  inputSchema: z.object({
    uri: z.string().describe('File URI to read, e.g., file:///path/to/file.md'),
  }),
  execute: async ({ uri }) => {
    try {
      const content = await onote.dataSource.invoke('readText', uri);
      return content;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to read file: ${errorMessage}`);
    }
  },
});

export const writeFile = tool({
  description: 'Write content to file URI (will overwrite existing file)',
  inputSchema: z.object({
    uri: z.string().describe('File URI to write, e.g., file:///path/to/file.md'),
    content: z.string().describe('Content to write to the file'),
  }),
  execute: async ({ uri, content }) => {
    try {
      await onote.dataSource.invoke('writeText', uri, content);
      return 'File written successfully';
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to write file: ${errorMessage}`);
    }
  },
});

export const listFiles = tool({
  description: 'List files in a directory',
  inputSchema: z.object({
    uri: z.string().describe('Directory URI to list, e.g., file:///path/to/dir'),
  }),
  execute: async ({ uri }) => {
    try {
      const files = await onote.dataSource.invoke('list', uri);
      return JSON.stringify(files, null, 2);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to list files: ${errorMessage}`);
    }
  },
});

export const searchInFile = tool({
  description: 'Search for text content within a file',
  inputSchema: z.object({
    uri: z.string().describe('File URI to search in, e.g., file:///path/to/file.md'),
    query: z.string().describe('Text to search for'),
  }),
  execute: async ({ uri, query }) => {
    try {
      const content: string = await onote.dataSource.invoke('readText', uri);
      const lines = content.split('\n');
      const matches = lines
        .map((line, index) => ({ line, lineNum: index + 1 }))
        .filter(({ line }) => line.includes(query));

      if (matches.length === 0) {
        return `No matches found for "${query}"`;
      }

      const result = matches
        .map(({ line, lineNum }) => `${lineNum}: ${line.trim()}`)
        .join('\n');
      return `Found ${matches.length} matches:\n${result}`;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to search in file: ${errorMessage}`);
    }
  },
});

export const TOOLS = {
  readFile,
  writeFile,
  listFiles,
  searchInFile,
} as const;
