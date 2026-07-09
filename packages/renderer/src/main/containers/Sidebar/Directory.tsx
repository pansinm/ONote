import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import type { ItemParams } from 'react-contexify';
import { useContextMenu } from 'react-contexify';
import useFileOperation from '/@/hooks/useFileOperation';
import NoDirectory from './NoDirectory';
import '@sinm/react-file-tree/styles.css';
import '@sinm/react-file-tree/icons.css';
import eventbus from '/@/main/eventbus/eventbus';
import { FILE_CREATED, FILE_DELETED, FILE_RENAMED, FILE_MOVED } from '/@/main/eventbus/EventName';

const DIRECTORY_MENU_ID = 'DIRECTORY_MENU';

import orderBy from 'lodash/orderBy';
import { when } from 'mobx';
import { getParentUri, isEquals, pathanme } from '/@/common/utils/uri';
import fileService from '../../services/fileService';
import Pop from '/@/utils/Pop';

interface DirectoryMenuProps {
  uri: string;
}

function getMenuNodeUri(itemParams: ItemParams<DirectoryMenuProps>): string {
  if (!itemParams.props) {
    throw new Error('Missing file tree node for context menu');
  }
  return itemParams.props.uri;
}

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
  const [tree, setTree] = useState<TreeNode | undefined>(undefined);
  const { t } = useTranslation('menu');

  const dirMenus: MenuItem[] = useMemo(() => [
    { id: 'CREATE_FILE', title: t('createNote') },
    { id: 'CREATE_DIRECTORY', title: t('createDirectory') },
    { id: 'RENAME', title: t('renameNote') },
    { id: 'DELETE', title: t('deleteDirectory') },
    { id: 'COPY_PATH', title: t('copyPath') },
  ], [t]);

  const { show: showDirMenu } = useContextMenu({ id: DIRECTORY_MENU_ID });

  const refreshDir = useCallback((dirUri: string) => {
    return fileService.listDir(dirUri).then((children) => {
      setTree((t) => {
        if (!t) return t;
        return utils.assignTreeNode(t, dirUri, {
          children: children.filter((child) => child.type === 'directory'),
          expanded: true,
        });
      });
    });
  }, []);

  const toggleExpanded = (treeNode: TreeNode) => {
    if (treeNode.type !== 'directory') return;
    const shouldLoadChildren = !treeNode.children;
    setTree((t) =>
      utils.assignTreeNode(t, treeNode.uri, {
        expanded: !treeNode.expanded,
      }),
    );
    if (shouldLoadChildren) {
      refreshDir(treeNode.uri);
    }
  };

  const removeTreeNode = (uri: string) => {
    setTree((t) => utils.removeTreeNode(t, uri));
  };

  useEffect(() => {
    if (rootUri) {
      fileService.getTreeNode(rootUri).then((node) => {
        node.children = node.children?.filter(
          (item) => item.type === 'directory',
        );
        setTree(node);
        toggleExpanded(node);
      });
    } else {
      setTree(undefined);
    }
  }, [rootUri]);

  // 用于防抖的 pending fileUri（在一次事件风暴中只保留最后一个）
  const pendingRefreshUriRef = useRef<string | undefined>(undefined);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 刷新所有已展开目录的 children（带防抖：100ms 内的多次事件合并为一次刷新）
  const refreshExpandedDirs = useCallback((fileUri?: string) => {
    // 记录最新的 fileUri
    pendingRefreshUriRef.current = fileUri;

    // 清除之前的定时器，合并短时间内的多次事件
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    refreshTimerRef.current = setTimeout(() => {
      const targetFileUri = pendingRefreshUriRef.current;
      pendingRefreshUriRef.current = undefined;
      refreshTimerRef.current = null;

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
        if (targetFileUri && typeof targetFileUri === 'string') {
          const parentNode = utils.getParentNode(prev, targetFileUri);
          if (parentNode && !parentNode.expanded) {
            targetDirUri = parentNode.uri;
          }
        }

        const dirsToRefresh = targetDirUri && !expandedDirs.includes(targetDirUri)
          ? [...expandedDirs, targetDirUri]
          : expandedDirs;

        if (dirsToRefresh.length === 0) return prev;

        // 异步刷新各个目录的 children
        dirsToRefresh.forEach((dirUri) => {
          refreshDir(dirUri);
        });
        return prev; // 不直接改 tree，异步回调里改
      });
    }, 100);
  }, [refreshDir]);

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

  // 外部变更事件（MCP / REST API）刷新文件树
  useEffect(() => {
    const handleEvent = (...args: unknown[]) => {
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

  const pasteFilesToDir = useCallback(async (targetDirUri: string) => {
    if (stores.activationStore.dataSourceId !== 'local') {
      Pop.showToast({ message: t('pasteLocalOnly'), type: 'warning' });
      return;
    }

    const sourcePaths: string[] = window.simmer.readFilePathsFromClipboard();
    if (sourcePaths.length === 0) {
      Pop.showToast({ message: t('pasteNoFiles'), type: 'warning' });
      return;
    }

    try {
      const copiedNodes = await fileService.copyLocalFilesToDir(sourcePaths, targetDirUri);
      await refreshDir(targetDirUri);
      Pop.showToast({
        message: t('pasteSuccess', { count: copiedNodes.length }),
        type: 'success',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      Pop.showToast({
        message: t('pasteFailed', { message }),
        type: 'error',
      });
      throw error;
    }
  }, [refreshDir, t]);

  const handleDirMenuClick: MenuProps['onClick'] = async (menu, menuProps) => {
    const dirUri = getMenuNodeUri(menuProps);
    switch (menu.id) {
      case 'CREATE_DIRECTORY':
        return createFile(dirUri, 'directory').then((treeNode) => {
          if (treeNode) {
            // 右键目录创建后立刻刷新父目录，避免只有 expanded 状态变化导致目录反而被折叠
            refreshDir(dirUri);
          }
        });
      case 'CREATE_FILE':
        return createFile(dirUri, 'file').then((treeNode) => {
          if (treeNode) {
            // 右键目录创建后立刻刷新父目录，保持展开并展示新笔记
            refreshDir(dirUri);
            stores.activationStore.activeFile(treeNode.uri);
          }
        });
      case 'RENAME':
        // renameFile 内部调用 fileService.rename，后端发出事件后由 refreshExpandedDirs 自动刷新树
        return renameFile(dirUri, 'directory');
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
      case 'PASTE':
        return pasteFilesToDir(dirUri);
      default:
        return;
    }
  };

  const treeItemRenderer: FileTreeProps['itemRenderer'] = useCallback(
    (treeNode: TreeNode) => (
      <FileTreeItem
        active={isEquals(treeNode.uri, stores.activationStore.activeDirUri)}
        onContextMenu={(event) => showDirMenu(event, { props: treeNode })}
        treeNode={treeNode}
      />
    ),
    [showDirMenu],
  );

  const handleDrop: FileTreeProps['onDrop'] = async (e, fromUri, toDirUri) => {
    e.preventDefault();
    // 等待文件保存完成
    if (stores.fileStore.states[fromUri] === 'changed') {
      await when(() => stores.fileStore.states[fromUri] !== 'changed');
    }
    // 关闭源文件/目录下的所有打开标签
    stores.activationStore.closeFile(fromUri);
    stores.activationStore.closeFilesInDir(fromUri);
    const to = await fileService.move(fromUri, toDirUri);
    // 移动完成后通过事件自动刷新树，不需要手动操作节点
  };

  const localDirMenus = useMemo(() =>
    stores.activationStore.dataSourceId === 'local'
      ? [
          ...dirMenus,
          { id: 'PASTE', title: t('paste') },
          { id: 'OPEN_FOLDER', title: t('openFolder') },
        ]
      : dirMenus,
  [dirMenus, t]);

  const handleItemClick = (treeNode: TreeNode) => {
    if (
      !treeNode.expanded ||
      stores.activationStore.activeDirUri === treeNode.uri
    ) {
      toggleExpanded(treeNode);
    } else {
      setTree((tree) => utils.replaceTreeNode(tree, treeNode.uri, { ...treeNode }));
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
        emptyRenderer={() => <NoDirectory>{t('openFolderHint')}</NoDirectory>}
        onItemClick={handleItemClick}
        itemRenderer={treeItemRenderer}
        rowHeight={34}
      />
      <Menu menuId={DIRECTORY_MENU_ID} menus={localDirMenus} onClick={handleDirMenuClick} />
      <Modal />
    </div>
  );
});

export default Directory;
