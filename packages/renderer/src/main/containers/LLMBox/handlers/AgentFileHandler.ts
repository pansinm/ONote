import { BaseHandler } from './BaseHandler';
import type {
  AgentFileReadResponse,
  AgentFileWriteResponse,
  AgentFileCreateResponse,
  AgentFileDeleteResponse,
  AgentFileListResponse,
  AgentFileSearchResponse,
  AgentFileSearchInResponse,
} from '../types';
import fileService from '/@/main/services/fileService';

export class AgentFileReadHandler extends BaseHandler {
  constructor(private stores: any) {
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
  constructor(private stores: any) {
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

export class AgentFileCreateHandler extends BaseHandler {
  constructor(private stores: any) {
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
  constructor(private stores: any) {
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
  constructor(private stores: any) {
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
  constructor(private stores: any) {
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
  constructor(private stores: any) {
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
