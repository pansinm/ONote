import type { FileService } from '@sinm/react-file-tree/lib/type';

export interface IFileService extends FileService {
  type?: string;
  connect(...args: any[]): Promise<unknown>;
  disconnect(): Promise<void>;
  readText(uri: string): Promise<string>;
  writeText(uri: string, content: string): Promise<void>;
  resolveUri(uri: string): Promise<string>;
}
