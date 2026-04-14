import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { FileTreeProps } from '@sinm/react-file-tree';
import { utils } from '@sinm/react-file-tree';
import { FileTree } from '@sinm/react-file-tree';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
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
import eventbus from '/@/main/eventbus/eventbus';
import { FILE_CREATED, FILE_DELETED, FILE_RENAMED, FILE_MOVED } from '/@/main/eventbus/EventName';

const DIRECTORY_MENU_ID = 'DIRECTORY_MENU';
const FILE_MENU_ID = 'FILE_MENU';

import orderBy from 'lodash/orderBy';
import { when } from 'mobx';
import { getParentUri, isEquals, pathanme } from '/@/common/utils/uri';
import fileService from '../../services/fileService';

// directory first, then by name
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
  const activeFileUri = stores.activationStore.activeFileUri;
  const [tree, setTree] = useState<TreeNode | undefined>(undefined);
  const { t } = useTranslation('menu');

  const dirMenus: MenuItem[] = useMemo(() => [
    { id: 'CREATE_FILE', title: t('createNote') },
    { id: 'CREATE_DIRECTORY', title: t('createDirectory') },
    { id: 'RENAME', title: t('renameNote') },
    { id: 'DELETE', title: t('deleteDirectory') },
    { id: 'COPY_PATH', title: t('copyPath') },
  ], [t]);

  const fileMenus: MenuItem[] = useMemo(() => [
    { id: 'RENAME_FILE', title: t('renameNote') },
    { id: 'DELETE_FILE', title: t('deleteNote') },
    { id: 'COPY_PATH', title: t('copyPath') },
    { id: 'EXPORT_PDF', title: t('exportPdf') },
  ], [t]);

  const { show: showDirMenu } = useContextMenu({ id: DIRECTORY_MENU_ID });
  const { show: showFileMenu } = useContextMenu({ id: FILE_MENU_ID });

  const toggleExpanded = (treeNode: TreeNode) => {
    if (treeNode.type !== 'directory') return;
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
            children,
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
        // 不再过滤：显示所有文件和文件夹
        setTree(node);
        toggleExpanded(node);
      });
    } else {
      setTree(undefined);
    }
  }, [rootUri]);

  // 刷新所有已展开目录的 children
  const refreshExpandedDirs = useCallback((fileUri?: string) => {
    setTree((prev) => {
      if (!prev) return prev;
      const expandedDirs: string[] = [];
      const collectExpanded = (node: TreeNode) => {
        if (node.type === 'directory' && node.expanded && node.children) {
          expandedDirs.push(node.uri);
          node.children.forEach(collectExpanded);
        }
      };
      collectExpanded(prev);

      // 如果传入了 fileUri，找到其父目录并确保展开
      let targetDirUri: string | undefined;
      if (fileUri && typeof fileUri === 'string') {
        const parentNode = utils.getParentNode(prev, fileUri);
        if (parentNode && !parentNode.expanded) {
          targetDirUri = parentNode.uri;
        }
      }

      // 异步刷新各个目录的 children
      const dirsToRefresh = targetDirUri && !expandedDirs.includes(targetDirUri)
        ? [...expandedDirs, targetDirUri]
        : expandedDirs;

      dirsToRefresh.forEach((dirUri) => {
        fileService.listDir(dirUri).then((children) => {
          setTree((t) => {
            const updated = utils.assignTreeNode(t, dirUri, { children, expanded: true } as any);
            return updated;
          });
        });
        // 如果该目录还没加载过 children，先设为 loading
        const dirNode = utils.getTreeNodeByUri(prev, dirUri);
        if (dirNode && !dirNode.children) {
          setTree((t) =>
            utils.assignTreeNode(t, dirUri, { loading: true } as any),
          );
        }
      });
      return prev; // 不直接改 tree，异步回调里改
    });
  }, []);

  // 外部变更事件（MCP / REST API）刷新文件树
  useEffect(() => {
    const handleEvent = (...args: unknown[]) => {
      // FILE_CREATED 事件第一个参数是 fileUri，用于定位父目录
      const fileUri = args[0] as string | undefined;
      refreshExpandedDirs(fileUri);
    };
    const events = [FILE_CREATED, FILE_DELETED, FILE_RENAMED, FILE_MOVED];
    events.forEach((evt) => eventbus.on(evt, handleEvent));
    return () => {
      events.forEach((evt) => eventbus.off(evt, handleEvent));
    };
  }, [refreshExpandedDirs]);

  const { Modal, createFile, deleteFile, renameFile } = useFileOperation();

  const handleDirMenuClick: MenuProps['onClick'] = async (menu, menuProps) => {
    const dirUri = (menuProps as unknown as TreeNode).uri;
    switch (menu.id) {
      case 'CREATE_DIRECTORY':
        return createFile(dirUri, 'directory').then((treeNode) => {
          if (treeNode) {
            // 确保父目录展开，children 由 refreshExpandedDirs 事件刷新
            setTree((t) => utils.assignTreeNode(t, dirUri, { expanded: true } as any));
          }
        });
      case 'CREATE_FILE':
        return createFile(dirUri, 'file').then((treeNode) => {
          if (treeNode) {
            // 确保父目录展开，children 由 refreshExpandedDirs 事件刷新
            setTree((t) => utils.assignTreeNode(t, dirUri, { expanded: true } as any));
            stores.activationStore.activeFile(treeNode.uri);
          }
        });
      case 'RENAME':
        return renameFile(dirUri, 'directory').then((node) => {
          replaceTreeNode(dirUri, node);
        });
      case 'DELETE':
        return deleteFile(dirUri, 'directory').then(() => {
          removeTreeNode(dirUri);
        });
      case 'OPEN_FOLDER':
        return window.simmer.openPath(getParentUri(dirUri));
      case 'COPY_PATH':
        return navigator.clipboard.writeText(
          decodeURIComponent(pathanme(dirUri)),
        );
      default:
        return;
    }
  };

  const handleFileMenuClick: MenuProps['onClick'] = async (menu, menuProps) => {
    const uri = (menuProps as unknown as TreeNode).uri;
    switch (menu.id) {
      case 'RENAME_FILE':
        return renameFile(uri, 'file').then((node) => {
          replaceTreeNode(uri, node);
        });
      case 'DELETE_FILE':
        return deleteFile(uri, 'file').then(() => {
          removeTreeNode(uri);
        });
      case 'COPY_PATH':
        return navigator.clipboard.writeText(decodeURIComponent(pathanme(uri)));
      case 'EXPORT_PDF': {
        const content = await fileService.readText(uri);
        return window.onote.export.invoke('exportToPdf', uri, content);
      }
      case 'OPEN_FOLDER':
        return window.simmer.openPath(getParentUri(uri));
      default:
        return;
    }
  };

  const treeItemRenderer: FileTreeProps['itemRenderer'] = useCallback(
    (treeNode: TreeNode) => {
      const isDir = treeNode.type === 'directory';
      return (
        <FileTreeItem
          onContextMenu={(event) => {
            if (isDir) {
              showDirMenu(event, { props: treeNode });
            } else {
              showFileMenu(event, { props: treeNode });
            }
          }}
          active={
            !isDir &&
            isEquals(treeNode.uri, activeFileUri)
          }
          treeNode={treeNode}
        />
      );
    },
    [showDirMenu, showFileMenu, activeFileUri],
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
  };

  const localDirMenus = useMemo(() =>
    stores.activationStore.dataSourceId === 'local'
      ? [...dirMenus, { id: 'OPEN_FOLDER', title: t('openFolder') }]
      : dirMenus,
  [dirMenus, t]);

  const localFileMenus = useMemo(() =>
    stores.activationStore.dataSourceId === 'local'
      ? [...fileMenus, { id: 'OPEN_FOLDER', title: t('openFolder') }]
      : fileMenus,
  [fileMenus, t]);

  const handleItemClick = (treeNode: TreeNode) => {
    if (treeNode.type === 'directory') {
      if (!treeNode.expanded || stores.activationStore.activeDirUri === treeNode.uri) {
        toggleExpanded(treeNode);
      } else {
        replaceTreeNode(treeNode.uri, { ...treeNode });
      }
      stores.activationStore.activeDir(treeNode.uri);
    } else {
      // 文件：直接打开
      stores.activationStore.activeFile(treeNode.uri);
    }
  };

  return (
    <div style={{ flex: 1, width: '100%' }}>
      <FileTree
        draggable
        sorter={sorter}
        tree={tree}
        onDrop={handleDrop}
        emptyRenderer={() => <NoDirectory>{t('openFolderHint')}</NoDirectory>}
        onItemClick={handleItemClick}
        itemRenderer={treeItemRenderer}
        rowHeight={34}
      />
      <Menu menuId={DIRECTORY_MENU_ID} menus={localDirMenus} onClick={handleDirMenuClick} />
      <Menu menuId={FILE_MENU_ID} menus={localFileMenus} onClick={handleFileMenuClick} />
      <Modal />
    </div>
  );
});

export default Directory;
