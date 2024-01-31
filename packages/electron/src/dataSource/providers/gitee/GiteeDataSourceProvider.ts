import type { TreeNode } from '@sinm/react-file-tree';
import * as path from 'path/posix';
import assert from 'assert';
import type { IDataSourceProvider } from '/@/dataSource';
import type { Client, ConnectConfig } from 'ssh2';
import * as os from 'os';
import * as fs from 'fs/promises';
import * as url from 'url';
import * as platformPath from 'path';
import _ from 'lodash';
import HttpClient from './HttpClient';
import { md5 } from '/@/utils/security';

type AuthForm = { access_token: string };

function parseGiteeUri(uri: string) {
  const filePath = url.fileURLToPath(uri);
  const [_, namespace, repo, pathname] = filePath.split('/');
  return {
    namespace,
    repo,
    pathname,
  };
}

function reposToTreeNode(repos: any[]): TreeNode {
  const records = repos
    .map<TreeNode>((repo) => ({
      uri: `file:///${repo.full_name}`,
      name: repo.path,
      type: 'directory',
      mtime: new Date(repo.pushed_at).getTime(),
    }))
    .reduce((prev, curr, index) => {
      const namespace = repos[index].namespace.path;
      if (!prev[namespace]) {
        prev[namespace] = {
          uri: `file:///${namespace}`,
          type: 'directory',
          name: namespace,
          mtime: Date.now(),
          children: [],
        } as TreeNode;
      }
      prev[namespace].children?.push(curr);
      return prev;
    }, {} as Record<string, TreeNode>);

  return {
    type: 'directory',
    uri: 'file:///',
    mtime: Date.now(),
    name: '/',
    children: Object.values(records),
  } as TreeNode;
}

class GiteeDataSourceProvider implements IDataSourceProvider<AuthForm> {
  private form?: AuthForm;

  private httpClient?: HttpClient;

  private rootUri?: string;

  private rootTreeNode?: TreeNode;

  getForm(): AuthForm {
    return this.form!;
  }

  providerId(): string {
    return 'gitee';
  }
  async connect(config: AuthForm) {
    this.form = config;
    this.httpClient = new HttpClient({
      headers: { Authorization: `Bearer ${config.access_token}` },
    });
  }

  async disconnect(): Promise<void> {
    this.form = undefined;
    this.httpClient = undefined;
  }

  setRootDirUri(rootDirUri: string): void {
    this.rootUri = rootDirUri;
  }

  getRootDirUri(): string {
    return this.rootUri || '';
  }

  async readFileAsTreeNode(filePath: string): Promise<TreeNode> {
    // const stats = await this.sftp.stat(filePath);
    // return {
    //   type: stats.isDirectory() ? 'directory' : 'file',
    //   mtime: stats.mtime,
    //   name: path.basename(filePath),
    //   uri: pathToUri(filePath),
    // } as TreeNode;
    throw new Error('not implemented');
  }

  async version(uri: string): Promise<number> {
    throw new Error('not implemented');
  }

  private async getRaw(uri: string): Promise<Buffer> {
    const { namespace, repo, pathname } = parseGiteeUri(uri);
    return this.httpClient!.getRaw(
      `https://gitee.com/api/v5/repos/${namespace}/${repo}/raw/${encodeURIComponent(
        pathname,
      )}`,
    );
  }

  read(uri: string): Promise<Buffer> {
    return this.getRaw(uri);
  }

  mkdir(uri: string): Promise<void> {
    throw new Error('not implemented');
  }

  async write(uri: string, buffer: Buffer) {
    throw new Error('not implemented');
  }

  async delete(uri: string) {
    throw new Error('not implemented');
  }

  async move(sourceUri: string, targetDirUri: string): Promise<TreeNode> {
    throw new Error('not implemented');
    // assert(this.sftp);
    // const source = uriToPath(sourceUri);
    // const target = uriToPath(targetDirUri);
    // const filename = path.basename(source);
    // const finalPath = path.posix.join(target, filename);
    // await this.sftp.rename(source, finalPath);
    // return this.readFileAsTreeNode(finalPath);
  }

  async listDir(uri: string): Promise<TreeNode[]> {
    const { namespace, pathname, repo } = parseGiteeUri(uri);
    const dirUri = repo && !pathname ? uri + '/' : uri;
    const { children } = await this.getTreeNode(dirUri);
    if (children) {
      return children;
    }
    return (
      (await this.getGiteeTreeNode(namespace, repo, pathname)).children || []
    );
  }

  async getGiteeTreeNode(
    namespace: string,
    repo: string,
    pathname: string,
  ): Promise<TreeNode> {
    const filePath = pathname || '/';
    assert(this.httpClient);
    const contents = await this.httpClient.get(
      `https://gitee.com/api/v5/repos/${namespace}/${repo}/contents/${encodeURIComponent(
        filePath,
      )}`,
    );
    const type = Array.isArray(contents) ? 'directory' : 'file';
    return {
      name: filePath.split('/').pop(),
      type,
      mtime: Date.now(),
      children: Array.isArray(contents)
        ? contents.map((content) => {
            return {
              uri: `file:///${namespace}/${repo}/${content.path}`,
              name: content.name,
              type: content.type === 'dir' ? 'directory' : 'file',
            } as TreeNode;
          })
        : undefined,
      uri: `file:///${namespace}/${repo}${pathname ? `/${pathname}` : ''}`,
    } as TreeNode;
  }

  async getTreeNode(uri: string): Promise<TreeNode> {
    assert(this.httpClient);
    const { namespace, repo, pathname } = parseGiteeUri(uri);
    if (!namespace || !this.rootTreeNode) {
      const result = await this.httpClient?.get(
        'https://gitee.com/api/v5/user/repos?type=owner&sort=full_name&page=1&per_page=100',
      );
      this.rootTreeNode = reposToTreeNode(result);
      console.log(this.rootTreeNode, Object.keys(result));
      return this.rootTreeNode!;
    }
    assert(this.rootTreeNode);
    const namespaceNode = this.rootTreeNode.children?.find(
      (node) => (node as any).name === namespace,
    ) as TreeNode;

    if (!repo) {
      return namespaceNode;
    }

    if (pathname === undefined) {
      return namespaceNode.children?.find(
        (node) => (node as any).name === repo,
      ) as TreeNode;
    }

    return this.getGiteeTreeNode(namespace, repo, pathname);
  }

  async search(rootUri: string, keywords: string): Promise<TreeNode[]> {
    throw new Error('not implemented');
  }

  async rename(uri: string, name: string): Promise<TreeNode> {
    throw new Error('not implemented');
    // assert(this.sftp);
    // const sourcePath = uriToPath(uri);
    // const dirPath = path.dirname(sourcePath);
    // const finalPath = path.join(dirPath, name);
    // await this.sftp.rename(sourcePath, finalPath);
    // return this.readFileAsTreeNode(finalPath);
  }

  async cache(uri: string): Promise<string> {
    assert(this.httpClient);
    const proj = md5(JSON.stringify(this.form) + this.rootUri);

    const remotePath = parseGiteeUri(uri).pathname;

    const localPath = platformPath.join(
      os.tmpdir(),
      proj,
      `./${remotePath.replaceAll(':', '')}`,
    );
    await fs
      .mkdir(platformPath.dirname(localPath), { recursive: true })
      .catch((err) => {
        // ignore
      });
    try {
      await this.httpClient.download(uri, localPath);
    } catch (err) {
      console.log(err, remotePath, localPath, uri);
      throw err;
    }
    return localPath;
  }
}

export default GiteeDataSourceProvider;
