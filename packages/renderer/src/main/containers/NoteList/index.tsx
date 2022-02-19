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

const MENU_ID = 'NOTE_MENU';

const NoteList: FC = observer(() => {
  const {
    noteStore,
    configStore,
    activationStore: resourceStore,
    notepadStore,
  } = stores;

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
  const { open: openPrompt, Prompt } = usePrompt();
  const { open: openConfirm, Confirm } = useConfirm();

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

  const moveToMenu = notepadStore.notepads
    .filter((pad) => pad.id !== configStore.active?.id)
    .map((pad) => ({
      id: 'MOVE_TO_' + pad.id,
      title: pad.name,
      data: pad.id,
    }));

  if (moveToMenu.length) {
    menus.splice(2, 0, {
      id: 'MOVE_NOTE',
      title: '移动笔记到',
      children: moveToMenu,
    });
  }

  const createNote = async () => {
    let name = await openPrompt({
      title: '创建笔记',
      defaultValue: '',
      description: '请输入笔记名称:',
    });
    if (!name) {
      return;
    }
    if (!name.includes('.')) {
      name = name + '.md';
    }
    await window.fileService.create(dirUri, {
      type: 'file',
      uri: dirUri + '/' + encodeURIComponent(name),
    });
    refreshFiles();
  };

  const deleteNote = async (uri: string) => {
    const tips = (
      <>
        是否删除笔记
        <span style={{ color: 'red' }}>{noteStore.notes[uri]?.title}</span>
      </>
    );
    if (
      await openConfirm({
        title: '删除笔记',
        content: tips,
        shouldCloseOnEsc: true,
      })
    ) {
      stores.activationStore.closeFile(uri);
      await window.fileService.remove(uri);
      refreshFiles();
    }
  };

  const renameNote = async (id: string) => {
    const title = noteStore.notes[id]?.title;
    const newName = await openPrompt({
      title: '重命名',
      defaultValue: title,
      description: '请输入笔记标题',
    });
    if (newName) {
      stores.renameNote(id, newName);
    }
  };

  const moveNoteTo = async (noteId: string, notepadId: string) => {
    stores.moveNoteTo(noteId, notepadId);
  };

  const handleMenuClick: MenuProps['onClick'] = async (menu, menuProps) => {
    const noteId = (menuProps as any).noteId;
    if (menu.id.startsWith('MOVE_TO')) {
      const notepadId = menu.data;
      moveNoteTo(noteId, notepadId);
      return;
    }
    switch (menu.id) {
      case 'CREATE_NOTE':
        return createNote();
      case 'RENAME_NOTE':
        return renameNote(noteId);
      case 'DELETE_NOTE':
        return deleteNote(noteId);
      default:
        return;
    }
  };

  return (
    <div className={styles.NoteList}>
      <ListHeader
        onTextChange={setText}
        onNoteCreate={() => {
          if (configStore.active?.type === 'notepad') {
            createNote();
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
            showMenu(e, { props: { noteId: file.uri } });
          }}
          onClick={() => {
            stores.activationStore.openFile(file.uri);
            // resourceStore.openNote(note, noteStore.getNotePath(note));
          }}
          onClose={() => {
            deleteNote(file.uri);
          }}
        >
          <FileTreeItem treeNode={file} active={false} />
        </ListItem>
      ))}
      <Menu menuId={MENU_ID} menus={menus} onClick={handleMenuClick} />
      <Prompt />
      <Confirm />
    </div>
  );
});

export default NoteList;
