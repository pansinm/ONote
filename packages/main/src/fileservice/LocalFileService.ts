import * as fs from 'fs/promises';
import { LocalFileService } from '@sinm/react-file-tree/server';
import type { IFileService } from './types';

class _LocalFileService extends LocalFileService implements IFileService {
  type = 'local';
  async connect(config: any) {
    return null;
  }
  async disconnect() {
    return;
  }

  readText(uri: string): Promise<string> {
    const localPath = this.parsePath(uri);
    return fs.readFile(localPath, 'utf-8');
  }

  async writeText(uri: string, content: string): Promise<void> {
    const localPath = this.parsePath(uri);
    await fs.writeFile(localPath, content, 'utf-8');
  }
  async resolveUri(uri: string): Promise<string> {
    return this.parsePath(uri);
  }
}

export default _LocalFileService;
