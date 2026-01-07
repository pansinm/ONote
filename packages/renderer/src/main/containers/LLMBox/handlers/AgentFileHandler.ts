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
    return this.wrapWithErrorHandling(async () => {
      const model = await this.stores.fileStore.getOrCreateModel(data.uri);
      const content = model.getValue();
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
    return this.wrapWithErrorHandling(async () => {
      const model = await this.stores.fileStore.getOrCreateModel(data.uri);
      model.setValue(data.content);
      await fileService.writeText(data.uri, data.content);
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
    return this.wrapWithErrorHandling(async () => {
      await this.stores.fileStore.saveFile(data.uri, data.content || '');
      return { success: true };
    }, 'Failed to create file');
  }
}

export class AgentFileDeleteHandler extends BaseHandler {
  constructor(private stores: any) {
    super();
  }

  async handle(data: { uri: string }): Promise<AgentFileDeleteResponse> {
    return this.wrapWithErrorHandling(async () => {
      await this.stores.fileStore.closeFile(data.uri);
      await fileService.remove(data.uri);
      return { success: true };
    }, 'Failed to delete file');
  }
}

export class AgentFileListHandler extends BaseHandler {
  constructor(private stores: any) {
    super();
  }

  async handle(data: { uri: string }): Promise<AgentFileListResponse> {
    return this.wrapWithErrorHandling(async () => {
      const treeNode = await fileService.getTreeNode(data.uri);
      if (treeNode.type === 'file') {
        throw new Error('Cannot list files in a file');
      }
      const treeNodes = await fileService.listDir(data.uri);
      const files = treeNodes.map((node: any) => ({
        name: node.name,
        uri: node.uri,
        isDirectory: node.isDirectory,
      }));
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

      return { matches, count: matches.length };
    }, 'Failed to search in file');
  }
}
