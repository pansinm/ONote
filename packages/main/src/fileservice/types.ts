import type { FileService, TreeNode } from '@sinm/react-file-tree/lib/type';

export interface IFileService extends FileService {
  type?: string;
  connect(...args: any[]): Promise<unknown>;
  disconnect(): Promise<void>;
  readText(uri: string): Promise<string>;
  writeText(uri: string, content: string): Promise<void>;
  getLocalUri(uri: string): Promise<string>;
  searchFiles(rootUri: string, keywords: string): Promise<TreeNode[]>;
  readFile(uri: string): Promise<Buffer>;
  writeFile(uri: string, buffer: Buffer): Promise<void>;
}
