import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { FileTreeProps } from '@sinm/react-file-tree';
import { utils } from '@sinm/react-file-tree';
import { FileTree } from '@sinm/react-file-tree';
import { observer } from 'mobx-react-lite';
import stores from '../../stores';
import type { TreeNode } from '@sinm/react-file-tree/lib/type';
import FileTreeItem from '/@/components/FileTreeItem';
import Menu from '/@/components/Menu';
import type { MenuItem, MenuProps } from '/@/components/Menu';
import { useContextMenu } from 'react-contexify';
import useFileOperation from '/@/hooks/useFileOperation';
import NoDirectory from './NoDirectory';
import '@sinm/react-file-tree/styles.css';
import '@sinm/react-file-tree/icons.css';

const MENU_ID = 'DIRECTORY_MENU';
const MENUS: MenuItem[] = [
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

import orderBy from 'lodash/orderBy';
import { when } from 'mobx';
import { getParentUri, isEquals } from '/@/common/utils/uri';
import fileService from '../../services/fileService';

// directory first and filename dict sort
const sorter = (treeNodes: TreeNode[]) =>
  orderBy(
    treeNodes,
    [
      (node) => (node.type === 'directory' ? 0 : 1),
      (node) => utils.getFileName(node.uri),
    ],
    ['asc', 'asc'],
  );

const Directory = observer(() => {
  const rootUri = stores.activationStore.rootUri;
  const [tree, setTree] = useState<TreeNode | undefined>(undefined);

  const toggleExpanded = (treeNode: TreeNode) => {
    const loading = !treeNode.children;
    setTree((t) =>
      utils.assignTreeNode(t, treeNode.uri, {
        expanded: !treeNode.expanded,
        loading,
      } as any),
    );
    if (loading) {
      fileService.listDir(treeNode.uri).then((children) => {
        setTree((t) =>
          utils.assignTreeNode(t, treeNode.uri, {
            loading: false,
            children: children.filter((child) => child.type === 'directory'),
          } as any),
        );
      });
    }
  };

  const appendTreeNode = (uri: string, treeNode: TreeNode) => {
    setTree((t) => utils.appendTreeNode(t, uri, treeNode));
  };

  const replaceTreeNode = (uri: string, treeNode: TreeNode) => {
    setTree((t) => utils.replaceTreeNode(t, uri, treeNode));
  };

  const removeTreeNode = (uri: string) => {
    setTree((t) => utils.removeTreeNode(t, uri));
  };

  useEffect(() => {
    if (rootUri) {
      fileService.getTreeNode(rootUri).then((node) => {
        setTree(node);
        toggleExpanded(node);
      });
    } else {
      setTree(undefined);
    }
  }, [rootUri]);

  const { show: showMenu } = useContextMenu({
    id: MENU_ID,
  });

  const { Modal, createFile, deleteFile, renameFile } = useFileOperation();

  const handleMenuClick: MenuProps['onClick'] = async (menu, menuProps) => {
    const dirUri = (menuProps as unknown as TreeNode).uri;
    switch (menu.id) {
      case 'CREATE_DIRECTORY':
        return createFile(dirUri, 'directory').then((treeNode) => {
          treeNode && appendTreeNode(dirUri, treeNode);
        });
      case 'RENAME_DIRECTORY':
        return renameFile(dirUri, 'directory').then((node) => {
          replaceTreeNode(dirUri, node);
        });
      case 'DELETE_DIRECTORY':
        return deleteFile(dirUri, 'directory').then(() => {
          removeTreeNode(dirUri);
        });
      case 'OPEN_FOLDER':
        return window.simmer.openPath(getParentUri(dirUri));
      default:
        return;
    }
  };

  const treeItemRenderer: FileTreeProps['itemRenderer'] = useCallback(
    (treeNode: TreeNode) => (
      <FileTreeItem
        onContextMenu={(event) => showMenu(event, { props: treeNode })}
        active={isEquals(treeNode.uri, stores.activationStore.activeDirUri)}
        treeNode={treeNode}
      />
    ),
    [],
  );

  const handleDrop: FileTreeProps['onDrop'] = async (e, fromUri, toDirUri) => {
    e.preventDefault();
    stores.activationStore.closeFile(fromUri);
    stores.activationStore.closeFilesInDir(fromUri);
    if (stores.fileStore.states[fromUri] === 'changed') {
      await when(() => stores.fileStore.states[fromUri] !== 'changed');
    }
    const to = await fileService.move(fromUri, toDirUri);
    await removeTreeNode(fromUri);
    await appendTreeNode(toDirUri, to);
    stores.fileListStore.refreshFiles();
  };

  let menus = MENUS;
  if (stores.activationStore.dataSourceId === 'local') {
    menus = [...MENUS, { id: 'OPEN_FOLDER', title: '打开所在文件夹' }];
  }

  const handleItemClick = (treeNode: TreeNode) => {
    if (
      !treeNode.expanded ||
      stores.activationStore.activeDirUri === treeNode.uri
    ) {
      toggleExpanded(treeNode);
    } else {
      replaceTreeNode(treeNode.uri, { ...treeNode });
    }
    stores.activationStore.activeDir(treeNode.uri);
  };

  return (
    <div style={{ flex: 1, width: '100%' }}>
      <FileTree
        draggable
        sorter={sorter}
        tree={tree}
        onDrop={handleDrop}
        emptyRenderer={() => <NoDirectory>先打开目录...</NoDirectory>}
        onItemClick={handleItemClick}
        itemRenderer={treeItemRenderer}
        rowHeight={34}
      />
      <Menu menuId={MENU_ID} menus={menus} onClick={handleMenuClick} />
      <Modal />
    </div>
  );
});

export default Directory;
