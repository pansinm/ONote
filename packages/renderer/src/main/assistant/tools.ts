import { tool } from 'ai';
import { z } from 'zod';
import * as monaco from 'monaco-editor';
import { v4 as uuidv4 } from 'uuid';

import stores from '../stores';
import fileService from '../services/fileService';
import type { PendingChange } from '../types/PendingChange';

export const readFile = tool({
  description:
    'Read file content from file URI, returns content with line numbers in format: lineNo|lineContent',
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
    uri: z
      .string()
      .describe('File URI to write, e.g., file:///path/to/file.md'),
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
    uri: z
      .string()
      .describe('Directory URI to list, e.g., file:///path/to/dir'),
  }),
  execute: async ({ uri }) => {
    try {
      const files = await fileService.listDir(uri);
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
    uri: z
      .string()
      .describe('File URI to search in, e.g., file:///path/to/file.md'),
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
  description:
    'Apply text edits using Monaco Editor range-based operations. Supports single-line, multi-line, and cross-line edits.',
  inputSchema: z.object({
    uri: z.string().describe('File URI to edit, e.g., file:///path/to/file.md'),
    patches: z
      .array(
        z.object({
          startLine: z.number().describe('Start line number (1-indexed)'),
          startColumn: z
            .number()
            .optional()
            .default(1)
            .describe('Start column (default: 1)'),
          endLine: z.number().describe('End line number (1-indexed)'),
          endColumn: z
            .number()
            .optional()
            .describe('End column (default: end of line)'),
          newText: z
            .string()
            .describe(
              'Replacement text (use "" for deletion, end with \\n for insertion)',
            ),
        }),
      )
      .describe('Array of edit operations using line/column ranges'),
  }),
  execute: async ({ uri, patches }) => {
    try {
      const model = await stores.fileStore.getOrCreateModel(uri);
      const versionId = model.getVersionId();
      const changes: PendingChange[] = [];
      const lineCount = model.getLineCount();

      // 预校验：所有 patch 的行号必须在合法范围内
      for (const patch of patches) {
        if (patch.startLine < 1 || patch.endLine < patch.startLine) {
          throw new Error(`Invalid line range: startLine=${patch.startLine}, endLine=${patch.endLine}`);
        }
        if (patch.endLine > lineCount) {
          throw new Error(`Line ${patch.endLine} out of bounds (file has ${lineCount} lines)`);
        }
      }

      // 倒序排序：从最后一行往前 apply，避免位置偏移
      const sortedPatches = [...patches].sort((a, b) => {
        if (b.startLine !== a.startLine) return b.startLine - a.startLine;
        return (b.startColumn ?? 1) - (a.startColumn ?? 1);
      });

      // 所有 patch 包在同一个 undo group 里，用户 Ctrl+Z 一次即可撤销
      model.pushStackElement();

      for (const patch of sortedPatches) {
        const startCol = patch.startColumn ?? 1;
        const endCol =
          patch.endColumn ?? model.getLineContent(patch.endLine).length + 1;
        const range = new monaco.Range(
          patch.startLine,
          startCol,
          patch.endLine,
          endCol,
        );
        const originalText = model.getValueInRange(range);

        // Apply 单个 patch（不带额外的 undo boundary）
        model.pushEditOperations([], [
          { range, text: patch.newText, forceMoveMarkers: true },
        ], () => []);

        // 计算新文本的精确 range
        const newLines = patch.newText.split('\n');
        const newEndLine = patch.startLine + newLines.length - 1;
        const newEndCol =
          newLines.length === 1
            ? startCol + newLines[0].length
            : newLines[newLines.length - 1].length;
        const newRange = new monaco.Range(
          patch.startLine,
          startCol,
          newEndLine,
          newEndCol,
        );

        // 立即创建 decoration
        const diffType =
          originalText === ''
            ? 'insert'
            : patch.newText === ''
              ? 'delete'
              : 'change';

        const [decorationId] = model.deltaDecorations([], [
          {
            range: newRange,
            options: {
              className: `agent-diff-${diffType}`,
              stickiness:
                monaco.editor.TrackedRangeStickiness
                  .NeverGrowsWhenTypingAtEdges,
              isWholeLine: true,
              overviewRuler: {
                color: '#3b82f6',
                position: monaco.editor.OverviewRulerLane.Full,
              },
            },
          },
        ]);

        changes.push({
          id: uuidv4(),
          uri,
          originalText,
          newText: patch.newText,
          decorationId,
          versionId,
          status: 'pending',
          label: `L${patch.startLine}${patch.endLine !== patch.startLine ? `-${patch.endLine}` : ''}`,
        });
      }

      model.pushStackElement();

      // 注册到 PendingChangeStore（不 save，等用户 review）
      stores.pendingChangeStore.addGroup(uri, changes);

      return `Applied ${patches.length} edit(s). Awaiting review.`;
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
