import { BaseHandler } from './BaseHandler';
import type {
  AgentFileReadResponse,
  AgentFileWriteResponse,
  AgentFileReplaceResponse,
  AgentFileCreateResponse,
  AgentFileDeleteResponse,
  AgentFileListResponse,
  AgentFileSearchResponse,
  AgentFileSearchInResponse,
} from '../types';
import { LLM_BOX_MESSAGE_TYPES } from '../../../../llmbox/utils/constants';
import fileService from '/@/main/services/fileService';
import stores from '/@/main/stores';

interface ReplaceOperation {
  mode: 'string' | 'regex' | 'line_range' | 'line_number';
  search: string;
  replace: string;
  replaceAll?: boolean;
  caseSensitive?: boolean;
  lineStart?: number;
  lineEnd?: number;
}

interface OperationResult {
  success: boolean;
  matches: number;
  changedLines: number[];
  error?: string;
}

function normalizeUri(uri: string): string {
  if (!uri || typeof uri !== 'string') {
    throw new Error('Invalid URI: URI is empty or not a string');
  }
  if (uri.startsWith('file://')) {
    return uri;
  }
  return `file://${uri}`;
}

export class AgentFileReadHandler extends BaseHandler {
  async handle(data: { uri: string }): Promise<AgentFileReadResponse> {
    this.logger.debug('AgentFileReadHandler.handle called', { uri: data.uri });

    return this.wrapWithErrorHandling(async () => {
      const normalizedUri = normalizeUri(data.uri);
      const model = await stores.fileStore.getOrCreateModel(normalizedUri);
      const content = model.getValue();

      this.logger.debug('File read successfully', {
        uri: normalizedUri,
        contentLength: content.length,
      });

      return { content };
    }, 'Failed to read file');
  }

  static getMessageType(): string {
    return LLM_BOX_MESSAGE_TYPES.AGENT_FILE_READ;
  }
}

export class AgentFileWriteHandler extends BaseHandler {
  async handle(data: {
    uri: string;
    content: string;
  }): Promise<AgentFileWriteResponse> {
    this.logger.debug('AgentFileWriteHandler.handle called', {
      uri: data.uri,
      contentLength: data.content.length,
    });

    return this.wrapWithErrorHandling(async () => {
      const normalizedUri = normalizeUri(data.uri);
      await fileService.writeText(normalizedUri, data.content);
      const model = await stores.fileStore.getOrCreateModel(normalizedUri);
      model.setValue(data.content);

      this.logger.debug('File written successfully', { uri: normalizedUri });

      return { success: true };
    }, 'Failed to write file');
  }

  static getMessageType(): string {
    return LLM_BOX_MESSAGE_TYPES.AGENT_FILE_WRITE;
  }
}

export class AgentFileReplaceHandler extends BaseHandler {
  async handle(data: {
    uri: string;
    operations: ReplaceOperation[];
    preview?: boolean;
  }): Promise<AgentFileReplaceResponse> {
    this.logger.debug('AgentFileReplaceHandler.handle called', {
      uri: data.uri,
      operationCount: data.operations.length,
      preview: data.preview || false,
    });

    return this.wrapWithErrorHandling(async () => {
      const normalizedUri = normalizeUri(data.uri);
      const originalContent = await fileService.readText(normalizedUri);

      if (!originalContent) {
        this.logger.warn('File is empty', { uri: normalizedUri });

        const operationResults = data.operations.map(
          () =>
            ({
              success: false,
              matches: 0,
              changedLines: [],
              error: 'File is empty',
            } as OperationResult),
        );

        return {
          success: true,
          modifiedLines: [],
          operations: operationResults,
        };
      }

      const lines = originalContent.split('\n');
      const allModifiedLines = new Set<number>();
      const operationResults: OperationResult[] = [];

      for (const operation of data.operations) {
        const result = await this.executeOperation(lines, operation);
        operationResults.push(result);

        if (result.success) {
          result.changedLines.forEach((line) => allModifiedLines.add(line));
        }
      }

      const modifiedContent = lines.join('\n');

      if (data.preview) {
        this.logger.debug('Preview mode, not saving changes', {
          uri: normalizedUri,
          modifiedLinesCount: allModifiedLines.size,
        });

        return {
          success: true,
          preview: modifiedContent,
          modifiedLines: Array.from(allModifiedLines).sort((a, b) => a - b),
          operations: operationResults,
        };
      }

      await fileService.writeText(normalizedUri, modifiedContent);
      const model = await stores.fileStore.getOrCreateModel(normalizedUri);
      model.setValue(modifiedContent);

      this.logger.debug('File content replaced successfully', {
        uri: normalizedUri,
        modifiedLinesCount: allModifiedLines.size,
      });

      return {
        success: true,
        modifiedLines: Array.from(allModifiedLines).sort((a, b) => a - b),
        operations: operationResults,
      };
    }, 'Failed to replace file content');
  }

  static getMessageType(): string {
    return LLM_BOX_MESSAGE_TYPES.AGENT_FILE_REPLACE;
  }

  private async executeOperation(
    lines: string[],
    operation: ReplaceOperation,
  ): Promise<OperationResult> {
    try {
      const { mode, search, replace } = operation;

      if (mode === 'string') {
        return this.executeStringReplace(lines, search, replace, operation);
      } else if (mode === 'regex') {
        return this.executeRegexReplace(lines, search, replace);
      } else if (mode === 'line_range') {
        return this.executeLineRangeReplace(lines, operation);
      } else if (mode === 'line_number') {
        return this.executeLineNumberReplace(lines, operation);
      } else {
        return {
          success: false,
          matches: 0,
          changedLines: [],
          error: `Unknown mode: ${mode}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        matches: 0,
        changedLines: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private executeStringReplace(
    lines: string[],
    search: string,
    replace: string,
    operation: ReplaceOperation,
  ): OperationResult {
    if (!search) {
      return {
        success: false,
        matches: 0,
        changedLines: [],
        error: 'Search string cannot be empty',
      };
    }

    const { replaceAll = false, caseSensitive = false } = operation;
    const flags = replaceAll
      ? caseSensitive
        ? 'g'
        : 'gi'
      : caseSensitive
      ? ''
      : 'i';
    const searchRegex = new RegExp(
      search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      flags,
    );

    const changedLines = new Set<number>();
    let matches = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const hasMatch = searchRegex.test(line);

      if (!hasMatch) {
        continue;
      }

      const newLine = line.replace(searchRegex, replace);

      if (newLine !== line) {
        matches++;
        lines[i] = newLine;
        changedLines.add(i + 1);
      }

      if (!replaceAll && matches > 0) {
        break;
      }
    }

    return {
      success: matches > 0,
      matches,
      changedLines: Array.from(changedLines),
    };
  }

  private executeRegexReplace(
    lines: string[],
    search: string,
    replace: string,
  ): OperationResult {
    if (!search) {
      return {
        success: false,
        matches: 0,
        changedLines: [],
        error: 'Search pattern cannot be empty',
      };
    }

    try {
      const searchRegex = new RegExp(search, 'g');
      const changedLines = new Set<number>();
      let matches = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!searchRegex.test(line)) {
          searchRegex.lastIndex = 0;
          continue;
        }
        searchRegex.lastIndex = 0;

        const newLine = line.replace(searchRegex, replace);

        if (newLine !== line) {
          const matchCount = (line.match(searchRegex) || []).length;
          matches += matchCount;
          lines[i] = newLine;
          changedLines.add(i + 1);
        }
        searchRegex.lastIndex = 0;
      }

      return {
        success: matches > 0,
        matches,
        changedLines: Array.from(changedLines),
      };
    } catch (error) {
      throw new Error(`Invalid regex pattern: ${error}`);
    }
  }

  private executeLineRangeReplace(
    lines: string[],
    operation: ReplaceOperation,
  ): OperationResult {
    const { lineStart, lineEnd, replace } = operation;

    if (lineStart === undefined || lineEnd === undefined) {
      return {
        success: false,
        matches: 0,
        changedLines: [],
        error: 'lineStart and lineEnd are required for line_range mode',
      };
    }

    if (lineStart < 1 || lineEnd > lines.length) {
      return {
        success: false,
        matches: 0,
        changedLines: [],
        error: `Line range ${lineStart}-${lineEnd} is out of bounds (file has ${lines.length} lines)`,
      };
    }

    const startIndex = lineStart - 1;
    const endIndex = lineEnd;

    const originalLines = lines.slice(startIndex, endIndex);
    const replacementLines = replace.split('\n');

    lines.splice(startIndex, originalLines.length, ...replacementLines);

    const changedLines: number[] = [];
    for (let i = startIndex; i < startIndex + replacementLines.length; i++) {
      changedLines.push(i + 1);
    }

    return {
      success: true,
      matches: replacementLines.length,
      changedLines,
    };
  }

  private executeLineNumberReplace(
    lines: string[],
    operation: ReplaceOperation,
  ): OperationResult {
    const { search, replace } = operation;
    const lineNumber = parseInt(search, 10);

    if (isNaN(lineNumber) || lineNumber < 1 || lineNumber > lines.length) {
      return {
        success: false,
        matches: 0,
        changedLines: [],
        error: `Invalid line number: ${search} (file has ${lines.length} lines)`,
      };
    }

    lines[lineNumber - 1] = replace;

    return {
      success: true,
      matches: 1,
      changedLines: [lineNumber],
    };
  }
}

export class AgentFileCreateHandler extends BaseHandler {
  async handle(data: {
    uri: string;
    content?: string;
  }): Promise<AgentFileCreateResponse> {
    this.logger.debug('AgentFileCreateHandler.handle called', {
      uri: data.uri,
      contentLength: data.content?.length || 0,
    });

    return this.wrapWithErrorHandling(async () => {
      const normalizedUri = normalizeUri(data.uri);
      await stores.fileStore.saveFile(normalizedUri, data.content || '');
      await fileService.writeText(normalizedUri, data.content || '');

      this.logger.debug('File created successfully', { uri: normalizedUri });

      return { success: true };
    }, 'Failed to create file');
  }

  static getMessageType(): string {
    return LLM_BOX_MESSAGE_TYPES.AGENT_FILE_CREATE;
  }
}

export class AgentFileDeleteHandler extends BaseHandler {
  async handle(data: { uri: string }): Promise<AgentFileDeleteResponse> {
    this.logger.debug('AgentFileDeleteHandler.handle called', {
      uri: data.uri,
    });

    return this.wrapWithErrorHandling(async () => {
      const normalizedUri = normalizeUri(data.uri);
      stores.fileStore.closeFile(normalizedUri);
      await fileService.remove(normalizedUri);

      this.logger.debug('File deleted successfully', { uri: normalizedUri });

      return { success: true };
    }, 'Failed to delete file');
  }

  static getMessageType(): string {
    return LLM_BOX_MESSAGE_TYPES.AGENT_FILE_DELETE;
  }
}

export class AgentFileListHandler extends BaseHandler {
  async handle(data: { uri: string }): Promise<AgentFileListResponse> {
    this.logger.debug('AgentFileListHandler.handle called', { uri: data.uri });

    return this.wrapWithErrorHandling(async () => {
      const normalizedUri = normalizeUri(data.uri);
      const treeNode = await fileService.getTreeNode(normalizedUri);
      if (treeNode.type === 'file') {
        this.logger.warn('Cannot list files in a file', {
          uri: normalizedUri,
          type: treeNode.type,
        });
        throw new Error('Cannot list files in a file');
      }

      const treeNodes = await fileService.listDir(normalizedUri);
      const files = treeNodes.map((node: any) => ({
        name: node.name,
        uri: node.uri,
        isDirectory: node.isDirectory,
      }));

      this.logger.debug('Directory listed successfully', {
        uri: normalizedUri,
        fileCount: files.length,
      });

      return { files };
    }, 'Failed to list directory');
  }

  static getMessageType(): string {
    return LLM_BOX_MESSAGE_TYPES.AGENT_FILE_LIST;
  }
}

export class AgentFileSearchHandler extends BaseHandler {
  async handle(data: {
    rootUri: string;
    keywords: string;
  }): Promise<AgentFileSearchResponse> {
    this.logger.debug('AgentFileSearchHandler.handle called', {
      rootUri: data.rootUri,
      keywords: data.keywords,
    });

    return this.wrapWithErrorHandling(async () => {
      const normalizedRootUri = normalizeUri(data.rootUri);
      const treeNodes = await fileService.searchFiles(
        normalizedRootUri,
        data.keywords,
      );
      const results = treeNodes.map((node: any) => ({
        name: node.name,
        uri: node.uri,
        isDirectory: node.isDirectory,
      }));

      this.logger.debug('Files searched successfully', {
        rootUri: data.rootUri,
        keywords: data.keywords,
        resultCount: results.length,
      });

      return { results };
    }, 'Failed to search files');
  }

  static getMessageType(): string {
    return LLM_BOX_MESSAGE_TYPES.AGENT_FILE_SEARCH;
  }
}

export class AgentFileSearchInHandler extends BaseHandler {
  async handle(data: {
    uri: string;
    pattern: string;
  }): Promise<AgentFileSearchInResponse> {
    this.logger.debug('AgentFileSearchInHandler.handle called', {
      uri: data.uri,
      pattern: data.pattern,
    });

    return this.wrapWithErrorHandling(async () => {
      const normalizedUri = normalizeUri(data.uri);
      const content = await fileService.readText(normalizedUri);

      const regex = new RegExp(data.pattern, 'gi');
      const matches: Array<{ line: number; text: string }> = [];

      const lines = content.split('\n');
      lines.forEach((line: string, index: number) => {
        if (regex.test(line)) {
          matches.push({ line: index + 1, text: line.trim() });
        }
      });

      this.logger.debug('Content searched successfully', {
        uri: normalizedUri,
        pattern: data.pattern,
        matchCount: matches.length,
      });

      return { matches, count: matches.length };
    }, 'Failed to search in file');
  }

  static getMessageType(): string {
    return LLM_BOX_MESSAGE_TYPES.AGENT_FILE_SEARCH_IN;
  }
}
