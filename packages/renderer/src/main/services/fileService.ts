import type { TreeNode } from '@sinm/react-file-tree';
import type { DataSourceCall } from '../../../../main/src/ipc/dataSource';

const callDataSource: DataSourceCall = (
  dataSourceId,
  functionName,
  ...args
) => {
  return (window.simmer.callDataSource as DataSourceCall)(
    dataSourceId,
    functionName,
    ...args,
  );
};

const fileService = {
  getService: async function (): Promise<{
    service: string | undefined;
    config: any;
  }> {
    const id = await callDataSource('current', 'getId');
    const config = await callDataSource('current', 'getConfig');
    return { service: id, config };
  },
  connect: async function (
    service: 'local' | 'ssh',
    config: any,
  ): Promise<void> {
    await callDataSource(service, 'authenticate', config);
    await callDataSource(service, 'setCurrent');
  },
  disconnect: async function (): Promise<void> {
    await callDataSource('current', 'disconnect');
  },
  read: async function (uri: string) {
    return callDataSource('current', 'getTreeNode', uri);
  },
  readdir: function (uri: string): Promise<TreeNode[]> {
    return callDataSource('current', 'listDir', uri);
  },
  move: function (uri: string, targetDirUri: string): Promise<TreeNode> {
    return callDataSource('current', 'move', uri, targetDirUri);
  },
  rename: function (uri: string, name: string): Promise<TreeNode> {
    return callDataSource('current', 'rename', uri, name);
  },
  create: async function (dirUri: string, node: TreeNode): Promise<TreeNode> {
    if (node.type === 'directory') {
      await callDataSource('current', 'mkdir', node.uri);
    } else {
      await callDataSource('current', 'writeText', node.uri, '');
    }
    return callDataSource('current', 'getTreeNode', node.uri);
  },
  remove: function (uri: string): Promise<void> {
    return callDataSource('current', 'delete', uri);
  },
  readText: function (uri: string): Promise<string> {
    return callDataSource('current', 'readText', uri);
  },
  writeText: function (uri: string, content: string): Promise<void> {
    return callDataSource('current', 'writeText', uri, content);
  },
  readFile: function (uri: string): Promise<Buffer> {
    return callDataSource('current', 'read', uri);
  },
  writeFile: function (uri: string, buffer: Buffer): Promise<void> {
    return callDataSource('current', 'write', uri, buffer);
  },
  getLocalUri: function (uri: string): Promise<string> {
    return callDataSource('current', 'cache', uri);
  },
  searchFiles: function (
    rootUri: string,
    keywords: string,
  ): Promise<TreeNode[]> {
    return callDataSource('current', 'search', rootUri, keywords);
  },
};

export default fileService;
