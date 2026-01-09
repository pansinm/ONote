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
import fileService from '/@/main/services/fileService';

interface Stores {
  fileStore: {
    getOrCreateModel: (
      uri: string,
    ) => Promise<{ setValue: (content: string) => void }>;
    closeFile: (uri: string) => Promise<void>;
    saveFile: (uri: string, content: string) => Promise<void>;
  };
}

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

export class AgentFileReadHandler extends BaseHandler {
  constructor(private stores: Stores) {
    super();
  }

  async handle(data: { uri: string }): Promise<AgentFileReadResponse> {
    this.logger.debug('AgentFileReadHandler.handle called', { uri: data.uri });

    return this.wrapWithErrorHandling(async () => {
      const model = await this.stores.fileStore.getOrCreateModel(data.uri);
      const content = model.getValue();

      this.logger.debug('File read successfully', {
        uri: data.uri,
        contentLength: content.length,
      });

      return { content };
    }, 'Failed to read file');
  }
}

export class AgentFileWriteHandler extends BaseHandler {
  constructor(private stores: Stores) {
    super();
  }

  async handle(data: {
    uri: string;
    content: string;
  }): Promise<AgentFileWriteResponse> {
    this.logger.debug('AgentFileWriteHandler.handle called', {
      uri: data.uri,
      contentLength: data.content.length,
    });

    return this.wrapWithErrorHandling(async () => {
      await fileService.writeText(data.uri, data.content);
      const model = await this.stores.fileStore.getOrCreateModel(data.uri);
      model.setValue(data.content);

      this.logger.debug('File written successfully', { uri: data.uri });

      return { success: true };
    }, 'Failed to write file');
  }
}

export class AgentFileReplaceHandler extends BaseHandler {
  constructor(private stores: Stores) {
    super();
  }

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
      const originalContent = await fileService.readText(data.uri);

      if (!originalContent) {
        this.logger.warn('File is empty', { uri: data.uri });

        const operationResults = data.operations.map(() => ({
          success: false,
          matches: 0,
          changedLines: [],
          error: 'File is empty',
        } as OperationResult));

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
          uri: data.uri,
          modifiedLinesCount: allModifiedLines.size,
        });

        return {
          success: true,
          preview: modifiedContent,
          modifiedLines: Array.from(allModifiedLines).sort((a, b) => a - b),
          operations: operationResults,
        };
      }

      await fileService.writeText(data.uri, modifiedContent);
      const model = await this.stores.fileStore.getOrCreateModel(data.uri);
      model.setValue(modifiedContent);

      this.logger.debug('File content replaced successfully', {
        uri: data.uri,
        modifiedLinesCount: allModifiedLines.size,
      });

      return {
        success: true,
        modifiedLines: Array.from(allModifiedLines).sort((a, b) => a - b),
        operations: operationResults,
      };
    }, 'Failed to replace file content');
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
        throw new Error(`Unknown mode: ${mode}`);
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
      ? (caseSensitive ? 'g' : 'gi')
      : (caseSensitive ? '' : 'i');
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
        const hasMatch = searchRegex.test(line);

        if (!hasMatch) {
          continue;
        }

        const newLine = line.replace(searchRegex, replace);

        if (newLine !== line) {
          const matchCount = (line.match(searchRegex) || []).length;
          matches += matchCount;
          lines[i] = newLine;
          changedLines.add(i + 1);
        }
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
      throw new Error('lineStart and lineEnd are required for line_range mode');
    }

    if (lineStart < 1 || lineEnd > lines.length) {
      throw new Error(`Line range ${lineStart}-${lineEnd} is out of bounds`);
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
      throw new Error(`Invalid line number: ${search}`);
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
  constructor(private stores: Stores) {
    super();
  }

  async handle(data: {
    uri: string;
    content?: string;
  }): Promise<AgentFileCreateResponse> {
    this.logger.debug('AgentFileCreateHandler.handle called', {
      uri: data.uri,
      contentLength: data.content?.length || 0,
    });

    return this.wrapWithErrorHandling(async () => {
      await this.stores.fileStore.saveFile(data.uri, data.content || '');
      await fileService.writeText(data.uri, data.content || '');

      this.logger.debug('File created successfully', { uri: data.uri });

      return { success: true };
    }, 'Failed to create file');
  }
}

export class AgentFileDeleteHandler extends BaseHandler {
  constructor(private stores: Stores) {
    super();
  }

  async handle(data: { uri: string }): Promise<AgentFileDeleteResponse> {
    this.logger.debug('AgentFileDeleteHandler.handle called', {
      uri: data.uri,
    });

    return this.wrapWithErrorHandling(async () => {
      await this.stores.fileStore.closeFile(data.uri);
      await fileService.remove(data.uri);

      this.logger.debug('File deleted successfully', { uri: data.uri });

      return { success: true };
    }, 'Failed to delete file');
  }
}

export class AgentFileListHandler extends BaseHandler {
  constructor(private stores: Stores) {
    super();
  }

  async handle(data: { uri: string }): Promise<AgentFileListResponse> {
    this.logger.debug('AgentFileListHandler.handle called', { uri: data.uri });

    return this.wrapWithErrorHandling(async () => {
      const treeNode = await fileService.getTreeNode(data.uri);
      if (treeNode.type === 'file') {
        this.logger.warn('Cannot list files in a file', {
          uri: data.uri,
          type: treeNode.type,
        });
        throw new Error('Cannot list files in a file');
      }

      const treeNodes = await fileService.listDir(data.uri);
      const files = treeNodes.map((node: any) => ({
        name: node.name,
        uri: node.uri,
        isDirectory: node.isDirectory,
      }));

      this.logger.debug('Directory listed successfully', {
        uri: data.uri,
        fileCount: files.length,
      });

      return { files };
    }, 'Failed to list directory');
  }
}

export class AgentFileSearchHandler extends BaseHandler {
  constructor(private stores: Stores) {
    super();
  }

  async handle(data: {
    rootUri: string;
    keywords: string;
  }): Promise<AgentFileSearchResponse> {
    this.logger.debug('AgentFileSearchHandler.handle called', {
      rootUri: data.rootUri,
      keywords: data.keywords,
    });

    return this.wrapWithErrorHandling(async () => {
      const treeNodes = await fileService.searchFiles(
        data.rootUri,
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
}

export class AgentFileSearchInHandler extends BaseHandler {
  constructor(private stores: Stores) {
    super();
  }

  async handle(data: {
    uri: string;
    pattern: string;
  }): Promise<AgentFileSearchInResponse> {
    this.logger.debug('AgentFileSearchInHandler.handle called', {
      uri: data.uri,
      pattern: data.pattern,
    });

    return this.wrapWithErrorHandling(async () => {
      const content = await fileService.readText(data.uri);

      const regex = new RegExp(data.pattern, 'gi');
      const matches: Array<{ line: number; text: string }> = [];

      const lines = content.split('\n');
      lines.forEach((line: string, index: number) => {
        if (regex.test(line)) {
          matches.push({ line: index + 1, text: line.trim() });
        }
      });

      this.logger.debug('Content searched successfully', {
        uri: data.uri,
        pattern: data.pattern,
        matchCount: matches.length,
      });

      return { matches, count: matches.length };
    }, 'Failed to search in file');
  }
}
