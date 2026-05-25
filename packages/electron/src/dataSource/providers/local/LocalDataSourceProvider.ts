import type { TreeNode } from '@sinm/react-file-tree';
import * as url from 'url';
import * as fs from 'fs/promises';
import * as path from 'path';
import type { IDataSourceProvider } from '/@/dataSource';

function statsToTreeNode(
  filePath: string,
  stats: Awaited<ReturnType<typeof fs.stat>>,
): TreeNode<{ mtime: number; name: string }> {
  return {
    mtime: stats.mtimeMs as number,
    uri: url.pathToFileURL(filePath).toString(),
    name: path.basename(filePath),
    type: stats.isFile() ? 'file' : 'directory',
  };
}

async function readFileAsTreeNode(filePath: string): Promise<TreeNode> {
  const stats = await fs.stat(filePath);
  return statsToTreeNode(filePath, stats);
}

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function resolveAvailablePath(targetPath: string): Promise<string> {
  if (!(await pathExists(targetPath))) {
    return targetPath;
  }

  const dirPath = path.dirname(targetPath);
  const ext = path.extname(targetPath);
  const baseName = path.basename(targetPath, ext);
  let index = 1;

  while (true) {
    const suffix = index === 1 ? ' copy' : ` copy ${index}`;
    const candidate = path.join(dirPath, `${baseName}${suffix}${ext}`);
    if (!(await pathExists(candidate))) {
      return candidate;
    }
    index += 1;
  }
}

class LocalDataSourceProvider implements IDataSourceProvider<null> {
  rootUri?: string;

  getForm(): null {
    return null;
  }

  providerId(): string {
    return 'local';
  }
  setRootDirUri(rootDirUri: string): void {
    this.rootUri = rootDirUri;
  }
  getRootDirUri(): string {
    return this.rootUri || '';
  }

  authenticateFormSchema = {
    title: '打开本地目录',
  };

  connect = <T>() => {
    return Promise.resolve();
  };
  disconnect() {
    return Promise.resolve();
  }
  async version(uri: string) {
    const localPath = url.fileURLToPath(uri);
    const stats = await fs.stat(localPath);
    return stats.mtimeMs;
  }
  read(uri: string) {
    const localPath = url.fileURLToPath(uri);
    return fs.readFile(localPath);
  }
  async mkdir(uri: string) {
    const localPath = url.fileURLToPath(uri);
    try {
      await fs.mkdir(localPath, { recursive: true });
    } catch (err) {
      return;
    }
  }
  async write(uri: string, buffer: Buffer) {
    const localPath = url.fileURLToPath(uri);
    try {
      await fs.access(localPath);
    } catch (err) {
      const error = err as NodeJS.ErrnoException;
      if (error.code === 'ENOENT') {
        const dirname = path.dirname(localPath);
        await fs.mkdir(dirname, { recursive: true }).catch((err) => 0);
      }
    }
    return fs.writeFile(localPath, Buffer.from(buffer));
  }
  delete(uri: string) {
    const localPath = url.fileURLToPath(uri);
    return fs.rm(localPath, { recursive: true });
  }
  async move(sourceUri: string, targetDirUri: string) {
    const source = url.fileURLToPath(sourceUri);
    const target = url.fileURLToPath(targetDirUri);
    const filename = path.basename(source);
    const finalPath = path.join(target, filename);
    await fs.rename(source, finalPath);
    return readFileAsTreeNode(finalPath);
  }
  async copyLocalFilesToDir(sourcePaths: string[], targetDirUri: string) {
    const targetDirPath = url.fileURLToPath(targetDirUri);
    const copiedNodes: TreeNode[] = [];

    for (const sourcePath of sourcePaths) {
      const stats = await fs.stat(sourcePath);
      const targetPath = await resolveAvailablePath(
        path.join(targetDirPath, path.basename(sourcePath)),
      );

      if (stats.isDirectory()) {
        await fs.cp(sourcePath, targetPath, { recursive: true });
      } else if (stats.isFile()) {
        await fs.copyFile(sourcePath, targetPath);
      } else {
        continue;
      }

      copiedNodes.push(await readFileAsTreeNode(targetPath));
    }

    return copiedNodes;
  }
  async listDir(uri: string) {
    const localPath = url.fileURLToPath(uri);
    const files = await fs.readdir(localPath, { withFileTypes: true });
    const promises = files
      .filter(
        (file) =>
          (file.isDirectory() || file.isFile()) &&
          file.name !== '.note' &&
          file.name !== '.DS_Store',
      )
      .map((file) => path.join(localPath, file.name))
      .map((filePath) => readFileAsTreeNode(filePath));
    return Promise.all(promises);
  }
  getTreeNode(uri: string) {
    const localPath = url.fileURLToPath(uri);
    return readFileAsTreeNode(localPath);
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
        if (
          decodeURIComponent(url.fileURLToPath(file.uri)).includes(keywords)
        ) {
          matchedFiles.push(file);
        }
      }
    }
    return matchedFiles;
  }

  async rename(uri: string, name: string): Promise<TreeNode> {
    const localPath = url.fileURLToPath(uri);
    const dirPath = path.dirname(localPath);
    const finalPath = path.join(dirPath, name);
    await fs.rename(localPath, finalPath);
    return readFileAsTreeNode(finalPath);
  }

  async cache(uri: string): Promise<string> {
    return url.fileURLToPath(uri);
  }
}

export default LocalDataSourceProvider;
