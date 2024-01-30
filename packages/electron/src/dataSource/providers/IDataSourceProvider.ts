import type { TreeNode } from '@sinm/react-file-tree';

// 鉴权
export interface IDataSourceProvider<T> {
  providerId(): string;
  getForm(): T;

  connect(form: T): Promise<void>;
  disconnect(): Promise<void>;

  setRootDirUri(rootDirUri: string): void;
  getRootDirUri(): string;

  // 对于内容的版本号
  version(uri: string): Promise<number>;
  read(uri: string): Promise<Buffer>;
  write(uri: string, buffer: Buffer): Promise<void>;
  delete(uri: string): Promise<void>;
  mkdir(uri: string): Promise<void>;

  // 树
  rename(uri: string, name: string): Promise<TreeNode>;
  move(sourceUri: string, targetDirUri: string): Promise<TreeNode>;
  listDir(uri: string): Promise<TreeNode[]>;
  getTreeNode(uri: string): Promise<TreeNode>;
  search(rootUri: string, keywords: string): Promise<TreeNode[]>;

  // 缓存到本地，返回本地路径
  cache(uri: string): Promise<string>;
}
