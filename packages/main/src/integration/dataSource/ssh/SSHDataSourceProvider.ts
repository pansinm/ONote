import type { TreeNode } from '@sinm/react-file-tree';
import * as path from 'path/posix';
import mimetypes from 'mime-types';
import assert from 'assert';
import type { IDataSourceProvider } from '/@/dataSource';
import type { Client, ConnectConfig } from 'ssh2';
import Sftp from './Sftp';
import { pathToUri, uriToPath } from '/@/utils/uri';
import * as os from 'os';
import * as fs from 'fs/promises';
import * as platformPath from 'path';
import { md5 } from '/@/utils/security';

type AuthForm = ConnectConfig;

class SSHDataSourceProvider implements IDataSourceProvider<AuthForm> {
  connect?: Client;

  sftp?: Sftp;

  authenticateFormSchema = {
    title: '打开本地目录',
  };

  async readFileAsTreeNode(filePath: string): Promise<TreeNode> {
    assert(this.sftp, 'sftp 未初始化');
    const stats = await this.sftp.stat(filePath);
    return {
      type: stats.isDirectory() ? 'directory' : 'file',
      uri: pathToUri(filePath),
      async: 'unload',
      mime: mimetypes.lookup(filePath),
    } as TreeNode;
  }

  async authenticate(config: AuthForm) {
    const sftp = new Sftp(config);
    try {
      await sftp.connect();
    } catch (err) {
      sftp.close();
      throw err;
    }
    this.sftp?.close();
    this.sftp = sftp;
  }

  async disconnect(): Promise<void> {
    return this.sftp?.close();
  }

  async version(uri: string) {
    assert(this.sftp);
    const remotePath = uriToPath(uri);
    const stats = await this.sftp.stat(remotePath);
    return stats.mtime;
  }

  read(uri: string) {
    assert(this.sftp);
    const remotePath = uriToPath(uri);
    return this.sftp.readFile(remotePath);
  }

  mkdir(uri: string): Promise<void> {
    assert(this.sftp);
    const remotePath = uriToPath(uri);
    return this.sftp.mkdir(remotePath);
  }
  async write(uri: string, buffer: Buffer) {
    assert(this.sftp);
    const remotePath = uriToPath(uri);
    await this.sftp.writeFile(remotePath, buffer);
  }

  async delete(uri: string) {
    assert(this.sftp);
    const remotePath = uriToPath(uri);
    const stats = await this.sftp.stat(remotePath);
    return stats.isDirectory()
      ? this.sftp.rmdir(remotePath)
      : this.sftp.unlink(remotePath);
  }

  async move(sourceUri: string, targetDirUri: string) {
    assert(this.sftp);
    const source = uriToPath(sourceUri);
    const target = uriToPath(targetDirUri);
    const filename = path.basename(source);
    const finalPath = path.posix.join(target, filename);
    await this.sftp.rename(source, finalPath);
    return this.readFileAsTreeNode(finalPath);
  }

  async listDir(uri: string) {
    assert(this.sftp);
    const remotePath = uriToPath(uri);
    const files = await this.sftp.readdir(remotePath);
    const promises = files
      .map((entry) => entry.filename)
      .map((filename) => path.join(remotePath, filename))
      .map((filePath) => this.readFileAsTreeNode(filePath));
    return Promise.all(promises);
  }

  getTreeNode(uri: string) {
    const remotePath = uriToPath(uri);
    return this.readFileAsTreeNode(remotePath);
  }

  async search(rootUri: string, keywords: string) {
    const matchedFiles: TreeNode[] = [];
    const files = await this.listDir(rootUri);
    for (const file of files) {
      if (file.type === 'directory') {
        if (matchedFiles.length > 30) {
          return matchedFiles;
        }
        matchedFiles.push(...(await this.search(file.uri, keywords)));
      } else {
        if (decodeURIComponent(uriToPath(file.uri)).includes(keywords)) {
          matchedFiles.push(file);
        }
      }
    }
    return matchedFiles;
  }

  async rename(uri: string, name: string): Promise<TreeNode> {
    assert(this.sftp);
    const sourcePath = uriToPath(uri);
    const dirPath = path.dirname(sourcePath);
    const finalPath = path.join(dirPath, name);
    await this.sftp.rename(sourcePath, finalPath);
    return this.readFileAsTreeNode(finalPath);
  }

  async cache(uri: string): Promise<string> {
    assert(this.sftp);
    const proj = md5(JSON.stringify(this.sftp.config));
    const remotePath = uriToPath(uri);
    const localPath = platformPath.join(os.tmpdir(), proj, `./${remotePath}`);

    await fs
      .mkdir(platformPath.dirname(localPath), { recursive: true })
      .catch((err) => {
        // ignore
      });
    await this.sftp.fastGet(remotePath, localPath);
    return localPath;
  }
}

export default SSHDataSourceProvider;