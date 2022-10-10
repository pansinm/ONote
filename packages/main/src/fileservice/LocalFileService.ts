import * as fs from 'fs/promises';
import { LocalFileService } from '@sinm/react-file-tree/server';
import type { IFileService } from './types';
import type { TreeNode } from '@sinm/react-file-tree/lib/type';
import { sortBy, last, orderBy } from 'lodash';
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

  getFileName(uri: string) {
    const url = new URL(uri);
    return decodeURIComponent(last(url.pathname.split('/')) as string);
  }

  async readdir(uri: string): Promise<TreeNode[]> {
    const treeNodes = await super.readdir(uri);
    return orderBy(
      treeNodes,
      (treeNode) => {
        return this.getFileName(treeNode.uri);
      },
      'asc',
    );
  }

  async writeText(uri: string, content: string): Promise<void> {
    const localPath = this.parsePath(uri);
    await fs.writeFile(localPath, content, 'utf-8');
  }
  async getLocalUri(uri: string): Promise<string> {
    return uri;
  }
  async searchFiles(rootUri: string, keywords: string): Promise<TreeNode[]> {
    const matchedFiles: TreeNode[] = [];
    const files = await this.readdir(rootUri);
    for (const file of files) {
      if (file.type === 'directory') {
        matchedFiles.push(...(await this.searchFiles(file.uri, keywords)));
      } else {
        console.log(keywords);
        if (decodeURIComponent(this.parsePath(file.uri)).includes(keywords)) {
          matchedFiles.push(file);
        }
      }
    }
    return matchedFiles;
  }
}

export default _LocalFileService;
