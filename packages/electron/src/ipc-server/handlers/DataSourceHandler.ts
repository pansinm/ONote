import IpcHandler from '../IpcHandler';

import type { TreeNode } from '@sinm/react-file-tree';
import type { IDataSourceProvider } from '/@/dataSource';
import { dataSource } from '/@/dataSource';

class DataSourceHandler extends IpcHandler implements IDataSourceProvider<any> {
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
