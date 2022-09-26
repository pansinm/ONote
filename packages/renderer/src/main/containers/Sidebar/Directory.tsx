import React, { useCallback, useRef } from 'react';
import type { FileTreeProps } from '@sinm/react-file-tree';
import { FileTree } from '@sinm/react-file-tree';
import { observer } from 'mobx-react-lite';
import stores from '../../stores';
import type { TreeNode } from '@sinm/react-file-tree/lib/type';
import { Uri } from 'monaco-editor';
import FileTreeItem from '/@/components/FileTreeItem';
import Menu from '/@/components/Menu';
import type { MenuItem, MenuProps } from '/@/components/Menu';
import { useContextMenu } from 'react-contexify';
import useFileOperation from '/@/hooks/useFileOperation';
import { when } from 'mobx';

const MENU_ID = 'DIRECTORY_MENU';
const menus: MenuItem[] = [
  {
    id: 'CREATE_DIRECTORY',
    title: '创建目录',
  },
  {
    id: 'RENAME_DIRECTORY',
    title: '修改名称',
  },
  {
    id: 'DELETE_DIRECTORY',
    title: '删除目录',
  },
];

const Directory = observer(() => {
  const rootUri = stores.activationStore.rootUri;
  const { show: showMenu } = useContextMenu({
    id: MENU_ID,
  });
  const treeRef = useRef<React.ElementRef<typeof FileTree>>(null);
  const { Modal, createFile, deleteFile, renameFile } = useFileOperation();

  const handleMenuClick: MenuProps['onClick'] = async (menu, menuProps) => {
    const dirUri = (menuProps as unknown as TreeNode).uri;
    switch (menu.id) {
      case 'CREATE_DIRECTORY':
        return createFile(dirUri, 'directory').then((treeNode) => {
          treeNode && treeRef.current?.addNode(dirUri, treeNode);
        });
      case 'RENAME_DIRECTORY':
        return renameFile(dirUri, 'directory').then((node) => {
          treeRef.current?.replaceNode(dirUri, node);
        });
      case 'DELETE_DIRECTORY':
        return deleteFile(dirUri, 'directory').then(() => {
          treeRef.current?.removeNode(dirUri);
        });
      default:
        return;
    }
  };

  const treeItemRenderer: FileTreeProps['treeItemRenderer'] = useCallback(
    (treeNode: TreeNode) => (
      <FileTreeItem
        onContextMenu={(event) => showMenu(event, { props: treeNode })}
        active={treeNode.uri === stores.activationStore.activeDirUri}
        treeNode={treeNode}
      />
    ),
    [],
  );

  const handleDrop = async (fromUri: string, toDirUri: string) => {
    stores.activationStore.closeFile(fromUri);
    stores.activationStore.closeFilesInDir(fromUri);
    if (stores.fileStore.states[fromUri] === 'changed') {
      await when(() => stores.fileStore.states[fromUri] !== 'changed');
    }
    await treeRef.current?.move(fromUri, toDirUri);
    stores.fileListStore.refreshFiles();
  };

  return (
    <div style={{ flex: 1, width: '100%' }}>
      <FileTree
        draggable
        ref={treeRef}
        onRootTreeChange={(root) =>
          root && treeRef.current?.expand(root.uri, true)
        }
        onTreeItemClick={(treeNode) => {
          const activeDir = stores.activationStore.activeDirUri;
          stores.activationStore.activeDir(treeNode.uri);
          const isSelected = activeDir === treeNode.uri;
          const expanded = isSelected ? !treeNode.expanded : true;
          treeRef.current?.expand(treeNode.uri, expanded);
        }}
        doFilter={(treeNode) => treeNode.type === 'directory'}
        onDrop={handleDrop}
        onError={(err) => alert(err.message)}
        treeItemRenderer={treeItemRenderer}
        rootUri={rootUri}
        fileService={window.fileService}
        rowHeight={34}
      />
      <Menu menuId={MENU_ID} menus={menus} onClick={handleMenuClick} />
      <Modal />
    </div>
  );
});

export default Directory;
