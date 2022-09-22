import { observer } from 'mobx-react-lite';
import type { FC } from 'react';
import { useCallback } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import React from 'react';
import styles from './index.module.scss';
import stores from '../../stores';
import ListHeader from './ListHeader';
import ListItem from '/@/components/ListItem';
import type { MenuItem, MenuProps } from '/@/components/Menu';
import Menu from '/@/components/Menu';
import usePrompt from '/@/hooks/usePrompt';
import useConfirm from '/@/hooks/useConfirm';
import { useContextMenu } from 'react-contexify';
import type { TreeNode } from '@sinm/react-file-tree/lib/type';
import FileTreeItem from '/@/components/FileTreeItem';
import useFileOperation from '/@/hooks/useFileOperation';

const MENU_ID = 'NOTE_MENU';

const menus: MenuItem[] = [
  {
    id: 'CREATE_NOTE',
    title: '创建笔记',
  },
  {
    id: 'RENAME_NOTE',
    title: '修改名称',
  },
  {
    id: 'DELETE_NOTE',
    title: '删除笔记',
  },
];

const NoteList: FC = observer(() => {
  const { activationStore: resourceStore } = stores;

  const [files, setFiles] = useState<TreeNode[]>([]);

  const dirUri = stores.activationStore.activeDirUri;
  const refreshFiles = useCallback(() => {
    if (dirUri) {
      window.fileService.readdir(dirUri).then((nodes) => {
        if (dirUri === stores.activationStore.activeDirUri) {
          setFiles(nodes.filter((node) => node.type === 'file'));
        }
      });
    } else {
      setFiles([]);
    }
  }, [dirUri]);

  useEffect(() => {
    refreshFiles();
  }, [dirUri]);

  const [text, setText] = useState('');
  const { show: showMenu } = useContextMenu({
    id: MENU_ID,
  });

  const { Modal, createFile, deleteFile, renameFile } = useFileOperation();

  const handleMenuClick: MenuProps['onClick'] = async (menu, menuProps) => {
    const uri = (menuProps as any).uri;
    switch (menu.id) {
      case 'CREATE_NOTE':
        return createFile(dirUri, 'file').then(() => {
          refreshFiles();
        });
      case 'RENAME_NOTE':
        return renameFile(uri, 'file').then(() => refreshFiles());
      case 'DELETE_NOTE':
        return deleteFile(uri, 'file').then(() => refreshFiles());
      default:
        return;
    }
  };

  return (
    <div className={styles.NoteList}>
      <ListHeader
        onTextChange={setText}
        onNoteCreate={() => {
          if (stores.activationStore.activeDirUri) {
            createFile(stores.activationStore.activeDirUri, 'file').then(() =>
              refreshFiles(),
            );
          } else {
            alert('请选中笔记本');
          }
        }}
      />

      {files.map((file) => (
        <ListItem
          key={file.uri}
          active={resourceStore.activeFileUri === file.uri}
          onContextMenu={(e) => {
            showMenu(e, { props: { uri: file.uri } });
          }}
          onClick={() => {
            stores.activationStore.openFile(file.uri);
          }}
          onClose={() => {
            deleteFile(file.uri, 'file').then(() => refreshFiles());
          }}
        >
          <FileTreeItem treeNode={file} active={false} />
        </ListItem>
      ))}
      <Menu menuId={MENU_ID} menus={menus} onClick={handleMenuClick} />
      <Modal />
    </div>
  );
});

export default NoteList;
