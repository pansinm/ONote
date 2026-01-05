import IpcHandler from '../IpcHandler';
import type { WebContents } from 'electron';
import type { TreeNode } from '@sinm/react-file-tree';
import type { IDataSourceProvider } from '/@/dataSource';
import { dataSource } from '/@/dataSource';
import { getLogger } from '/@/shared/logger';

const logger = getLogger('DataSourceHandler');

/**
 * DataSource Handler
 *
 * 使用代理模式自动将 dataSource 对象的方法转换为 IPC handlers
 * 避免手动编写重复的代理方法
 */
class DataSourceHandler extends IpcHandler implements IDataSourceProvider<any> {
  constructor(sender: WebContents, namespace: string) {
    super(sender, namespace);
    this.proxyMethods();
  }

  /**
   * 自动代理 dataSource 的所有方法
   */
  private proxyMethods(): void {
    // 获取 dataSource 原型上的所有方法
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(dataSource))
      .filter(name => name !== 'constructor' && typeof dataSource[name as keyof typeof dataSource] === 'function');

    // 为每个方法创建代理
    methods.forEach(methodName => {
      (this as any)[methodName] = (...args: unknown[]) => {
        logger.debug(`Proxying method: ${methodName}`, { args: args.length });
        return (dataSource as any)[methodName](...args);
      };
    });

    logger.info(`Proxied ${methods.length} methods from dataSource`);
  }

  // 显式实现 IDataSourceProvider 接口（可选，用于类型检查）
  setRootDirUri(rootDirUri: string): void {
    return dataSource.setRootDirUri(rootDirUri);
  }
  getRootDirUri(): string {
    return dataSource.getRootDirUri();
  }
  getForm<T>() {
    return dataSource.getForm() as T;
  }
  providerId(): string {
    return dataSource.providerId();
  }
  setProvider(dataSourceId: string): void {
    return dataSource.setProvider(dataSourceId);
  }
  connect<T>(form: T): Promise<void> {
    return dataSource.connect(form);
  }
  disconnect(): Promise<void> {
    return dataSource.disconnect();
  }
  read(uri: string): Promise<Buffer> {
    return dataSource.read(uri);
  }
  mkdir(uri: string): Promise<void> {
    return dataSource.mkdir(uri);
  }
  write(uri: string, data: Buffer): Promise<void> {
    return dataSource.write(uri, data);
  }
  writeText(uri: string, text: string): Promise<void> {
    return dataSource.writeText(uri, text);
  }
  readText(uri: string): Promise<string> {
    return dataSource.readText(uri);
  }
  delete(uri: string): Promise<void> {
    return dataSource.delete(uri);
  }
  version(uri: string): Promise<number> {
    return dataSource.version(uri);
  }
  getTreeNode(uri: string): Promise<TreeNode> {
    return dataSource.getTreeNode(uri);
  }
  rename(uri: string, name: string): Promise<TreeNode> {
    return dataSource.rename(uri, name);
  }
  move(sourceUri: string, targetDirUri: string): Promise<TreeNode> {
    return dataSource.move(sourceUri, targetDirUri);
  }
  listDir(uri: string): Promise<TreeNode[]> {
    return dataSource.listDir(uri);
  }
  search(rootUri: string, keywords: string): Promise<TreeNode[]> {
    return dataSource.search(rootUri, keywords);
  }
  cache(uri: string): Promise<string> {
    return dataSource.cache(uri);
  }
}

export default DataSourceHandler;
