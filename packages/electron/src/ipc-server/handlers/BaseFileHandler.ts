import path from 'node:path';
import crypto from 'node:crypto';
import { uriToPath } from '/@/dataSource/providers/ssh/uri';
import IpcHandler from '../IpcHandler';
import { getLogger } from '/@/shared/logger';

const logger = getLogger('BaseFileHandler');

interface BaseHandlerParams {
  fileUri: string;
  rootUri: string;
}

export class BaseFileHandler extends IpcHandler {
  protected getBaseDir(rootUri: string): string {
    const rootPath = uriToPath(rootUri);
    return path.join(rootPath, '.onote', 'data');
  }

  protected getFilePath(fileUri: string, rootUri: string, fileName: string): string {
    const filePath = uriToPath(fileUri);
    const relativePath = path.relative(uriToPath(rootUri), filePath);
    const hash = crypto.createHash('md5').update(relativePath).digest('hex');
    const baseDir = this.getBaseDir(rootUri);
    return path.join(baseDir, hash, 'ai', fileName);
  }

  protected async ensureDirectoryExists(filePath: string): Promise<void> {
    const fs = await import('fs/promises');
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
  }

  protected async readJSONFile<T>(filePath: string): Promise<T | null> {
    const fs = await import('fs/promises');
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content) as T;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  protected async writeJSONFile<T>(filePath: string, data: T): Promise<void> {
    const fs = await import('fs/promises');
    await this.ensureDirectoryExists(filePath);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  protected async deleteFile(filePath: string): Promise<void> {
    const fs = await import('fs/promises');
    try {
      await fs.unlink(filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return;
      }
      throw error;
    }
  }
}
