import type { TreeNode } from '@sinm/react-file-tree/lib/type';
import type { ConnectConfig } from 'ssh2';
import { pathToFileURL } from 'url';
import type { Stream } from 'stream';
const Client = require('ssh2-sftp-client');
import type { IFileService } from './types';
import * as mimetypes from 'mime-types';
import * as path from 'path';
import * as os from 'os';
import { orderBy } from 'lodash';

async function stream2buffer(stream: Stream): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const _buf = Array<any>();

    stream.on('data', (chunk) => _buf.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(_buf)));
    stream.on('error', (err) => reject(`error converting stream - ${err}`));
  });
}

class SSHFileService implements IFileService {
  type = 'ssh';
  private sftp = new Client();
  connect(config: ConnectConfig) {
    return this.sftp.connect(config);
  }
  private parsePath(uri: string) {
    return decodeURIComponent(new URL(uri).pathname);
  }

  private pathToUri(path: string) {
    const uri = new URL('file:///');
    uri.pathname = path;
    return uri.toString();
  }

  disconnect() {
    if (this.sftp.sftp) {
      return this.sftp.end();
    }
  }
  async readAsTreeNode(aPath: string) {
    const stat = await this.sftp.stat(aPath);
    return {
      uri: this.pathToUri(aPath),
      mime: stat.isFile ? mimetypes.lookup(path.basename(aPath)) : false,
      type: stat.isFile ? 'file' : 'directory',
      async: stat.isDirectory ? 'unload' : undefined,
    } as TreeNode;
  }

  async read(uri: string) {
    return this.readAsTreeNode(this.parsePath(uri));
  }

  async readText(uri: string): Promise<string> {
    const buf = await this.readFile(uri);
    return buf.toString('utf-8');
  }

  async writeText(uri: string, content: string): Promise<void> {
    const remotePath = this.parsePath(uri);
    return this.sftp.put(Buffer.from(content, 'utf-8'), remotePath);
  }

  async readFile(uri: string): Promise<Buffer> {
    const remotePath = this.parsePath(uri);
    const stream = this.sftp.createReadStream(remotePath);
    const buf = await stream2buffer(stream);
    return buf;
  }

  async writeFile(uri: string, buffer: Buffer) {
    const remotePath = this.parsePath(uri);
    await this.sftp.mkdir(path.posix.dirname(remotePath), true).catch(() => {
      // ignore
    });
    return this.sftp.put(buffer, remotePath);
  }

  async readdir(uri: string): Promise<TreeNode[]> {
    const dir = this.parsePath(uri);
    let files: any[] = await this.sftp.list(dir);
    files = orderBy(files, 'name', 'asc');
    return files.map((file) => {
      return {
        uri: this.pathToUri(path.posix.resolve(dir, file.name)),
        mime: file.type !== 'd' ? mimetypes.lookup(file.name) : false,
        type: file.type === 'd' ? 'directory' : 'file',
        async: file.type === 'd' ? 'unload' : undefined,
      } as TreeNode;
    });
  }

  async move(fromUri: string, dirUri: string) {
    const from = this.parsePath(fromUri);
    const dirPath = this.parsePath(dirUri);
    const toPath = path.posix.join(dirPath, path.posix.basename(from));
    await this.sftp.rename(from, toPath);
    return this.readAsTreeNode(toPath);
  }

  async rename(uri: string, name: string) {
    const fromPath = this.parsePath(uri);
    const dirname = path.posix.dirname(fromPath);
    const toPath = path.posix.resolve(dirname, name);
    await this.sftp.rename(fromPath, toPath);
    return this.readAsTreeNode(toPath);
  }

  async create(uri: string, childNode: TreeNode) {
    const parentPath = this.parsePath(uri);
    const childPath = this.parsePath(childNode.uri);
    const childName = path.posix.basename(childPath);
    const fullPath = path.posix.join(parentPath, childName);
    if (childNode.type === 'directory') {
      await this.sftp.mkdir(fullPath, true);
    } else {
      const node = await this.readAsTreeNode(fullPath).catch((err) => false);
      if (node) {
        throw new Error('当前目录存在相同文件');
      }
      await this.sftp.put(Buffer.from(''), fullPath);
    }
    return this.readAsTreeNode(fullPath);
  }

  async remove(uri: string) {
    const aPath = this.parsePath(uri);
    const node = await this.readAsTreeNode(aPath);
    if (node.type === 'directory') {
      this.sftp.rmdir(aPath, { recursive: true });
    } else {
      this.sftp.delete(aPath);
    }
  }

  async getLocalUri(uri: string): Promise<string> {
    const remotePath = this.parsePath(uri);
    const tmpDir = os.tmpdir();
    const localPath = path.resolve(tmpDir, remotePath.replaceAll('/', '_'));
    await this.sftp.fastGet(remotePath, localPath);
    return pathToFileURL(localPath).toString();
  }
  async searchFiles(rootUri: string, keywords: string): Promise<TreeNode[]> {
    const matchedFiles: TreeNode[] = [];
    const files = await this.readdir(rootUri);
    for (const file of files) {
      if (file.type === 'directory') {
        matchedFiles.push(...(await this.searchFiles(file.uri, keywords)));
      } else {
        if (decodeURIComponent(this.parsePath(file.uri)).includes(keywords)) {
          matchedFiles.push(file);
        }
      }
    }
    return matchedFiles;
  }
}

export default SSHFileService;
