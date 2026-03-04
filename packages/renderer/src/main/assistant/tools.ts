import { tool } from 'ai';
import { z } from 'zod';
import * as monaco from 'monaco-editor';
import stores from '../stores';

export const readFile = tool({
  description: 'Read file content from file URI, returns content with line numbers in format: lineNo|lineContent',
  inputSchema: z.object({
    uri: z.string().describe('File URI to read, e.g., file:///path/to/file.md'),
  }),
  execute: async ({ uri }) => {
    try {
      const model = await stores.fileStore.getOrCreateModel(uri);
      const content = model.getValue();
      // Add line numbers in format: lineNo|lineContent
      const lines = content.split('\n');
      const numberedLines = lines.map((line, index) => `${index + 1}|${line}`);
      return numberedLines.join('\n');
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
      const model = await stores.fileStore.getOrCreateModel(uri);
      model.setValue(content);
      await stores.fileStore.save(uri);
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
      const onote = (window as any).onote;
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
      const model = await stores.fileStore.getOrCreateModel(uri);
      const content = model.getValue();
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

export const applyPatch = tool({
  description: 'Apply text edits using Monaco Editor range-based operations. Supports single-line, multi-line, and cross-line edits.',
  inputSchema: z.object({
    uri: z.string().describe('File URI to edit, e.g., file:///path/to/file.md'),
    patches: z.array(
      z.object({
        startLine: z.number().describe('Start line number (1-indexed)'),
        startColumn: z.number().optional().default(1).describe('Start column (default: 1)'),
        endLine: z.number().describe('End line number (1-indexed)'),
        endColumn: z.number().optional().describe('End column (default: end of line)'),
        newText: z.string().describe('Replacement text (use "" for deletion, end with \\n for insertion)'),
      }),
    ).describe('Array of edit operations using line/column ranges'),
  }),
  execute: async ({ uri, patches }) => {
    try {
      const model = await stores.fileStore.getOrCreateModel(uri);

      // Convert to Monaco edit operations
      const edits: monaco.editor.IIdentifiedSingleEditOperation[] = patches.map(patch => {
        const { startLine, startColumn = 1, endLine, endColumn, newText } = patch;

        // Calculate end column if not provided
        let actualEndColumn = endColumn;
        if (actualEndColumn === undefined) {
          const lineContent = model.getLineContent(endLine) || '';
          actualEndColumn = lineContent.length + 1;
        }

        return {
          range: new monaco.Range(startLine, startColumn, endLine, actualEndColumn),
          text: newText,
          forceMoveMarkers: true,
        };
      });

      // Apply all edits in one batch
      const { applyModelEdits } = await import('../monaco/utils');
      applyModelEdits(model, edits);

      // Save file
      await stores.fileStore.save(uri);

      return `Successfully applied ${patches.length} edit operation(s)`;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to apply edits: ${errorMessage}`);
    }
  },
});

export const TOOLS = {
  readFile,
  writeFile,
  listFiles,
  searchInFile,
  applyPatch,
} as const;
