import type { TreeNode } from '@sinm/react-file-tree';
import { sortTreeNodes } from '/@/common/utils/treeNode';
import { FILE_CONTENT_CHANGED } from '../eventbus/EventName';
import eventbus from '../eventbus';

const dataSource = window.onote.dataSource;

class FileService {
  constructor() {
    dataSource.addListener(FILE_CONTENT_CHANGED, (...args) => {
      eventbus.emit(FILE_CONTENT_CHANGED, ...args);
    });
  }
  async getProvider(): Promise<{
    providerId: string;
    config: any;
  }> {
    const id = await dataSource.invoke('providerId');
    const config = await dataSource.invoke('getForm');
    return { providerId: id, config };
  }
  async connect(providerId: string, config: any): Promise<void> {
    await dataSource.invoke('setProvider', providerId);
    await dataSource.invoke('connect', config);
  }
  async disconnect(): Promise<void> {
    await dataSource.invoke('disconnect');
  }
  setRootDirUri(uri: string) {
    return dataSource.invoke('setRootDirUri', uri);
  }
  async getTreeNode(uri: string): Promise<TreeNode> {
    return dataSource.invoke('getTreeNode', uri);
  }
  listDir(uri: string): Promise<TreeNode[]> {
    return dataSource.invoke('listDir', uri).then(sortTreeNodes);
  }
  move(uri: string, targetDirUri: string): Promise<TreeNode> {
    return dataSource.invoke('move', uri, targetDirUri);
  }
  rename(uri: string, name: string): Promise<TreeNode> {
    return dataSource.invoke('rename', uri, name);
  }
  async create(dirUri: string, node: TreeNode): Promise<TreeNode> {
    if (node.type === 'directory') {
      await dataSource.invoke('mkdir', node.uri);
    } else {
      await dataSource.invoke('writeText', node.uri, '');
    }
    return dataSource.invoke('getTreeNode', node.uri);
  }
  remove(uri: string): Promise<void> {
    return dataSource.invoke('delete', uri);
  }
  readText(uri: string): Promise<string> {
    return dataSource.invoke('readText', uri);
  }
  writeText(uri: string, content: string): Promise<void> {
    return dataSource.invoke('writeText', uri, content);
  }
  readFile(uri: string): Promise<Buffer> {
    return dataSource.invoke('read', uri);
  }
  writeFile(uri: string, buffer: Buffer): Promise<void> {
    return dataSource.invoke('write', uri, buffer);
  }
  getLocalUri(uri: string): Promise<string> {
    return dataSource.invoke('cache', uri);
  }
  searchFiles(rootUri: string, keywords: string): Promise<TreeNode[]> {
    return dataSource.invoke('search', rootUri, keywords);
  }
}

export default new FileService();
