import { observer, useLocalObservable } from 'mobx-react-lite';
import type { FC } from 'react';
import React, { useState } from 'react';
import { Collapse } from 'react-collapse';
import stores from '../../stores';
import Icon from '/@/components/Icon';
import Listitem from '/@/components/ListItem';
import Header from './Header';
import styles from './NotePadSection.module.scss';
// import Prompt from '/@/components/Prompt';
import type { MenuItem } from '/@/components/Menu';
import Menu from '/@/components/Menu';
import { useContextMenu } from 'react-contexify';
import useConfirm from '/@/hooks/useConfirm';
import usePrompt from '/@/hooks/usePrompt';
import Button from '/@/components/Button';

const MENU_ID = 'SIDEBAR_MENU';

const NotepadSection: FC = observer(() => {
  const { notepadStore, configStore, noteStore } = stores;
  const [isOpen, setIsOpen] = useState(true);
  const { open: openConfirmBox, Confirm } = useConfirm();
  const { open: openPrompt, Prompt } = usePrompt();
  const { show } = useContextMenu({
    id: MENU_ID,
  });

  const handleMenuClick = async (menu: MenuItem, prop: any) => {
    const notepadId = prop.notepadId;
    const notepadName = notepadStore.get(notepadId)?.name;
    const renameNotepad = async () => {
      const newName = await openPrompt({
        title: '修改笔记本名称',
        defaultValue: notepadName,
        description: '请输入笔记本名称:',
      });
      if (newName) {
        stores.renameNotepad(notepadId, newName);
      }
    };
    const deleteNotepad = async () => {
      await openConfirmBox({
        title: '删除',
        content: (
          <>
            确定要删除笔记本 <span style={{ color: 'red' }}>{notepadName}</span>{' '}
            及其所有笔记？
          </>
        ),
      });
      stores.deleteNotePad(notepadId);
    };
    switch (menu.id) {
      case 'RENAME':
        renameNotepad();
        break;
      case 'DELETE':
        deleteNotepad();
        break;
      default:
        break;
    }
  };

  const createNotepad = async () => {
    const name = await openPrompt({
      title: '新建笔记本',
      defaultValue: '',
      description: '请输入笔记本名称:',
    });
    if (name) {
      stores.createNotepad(name);
    }
  };

  return (
    <div className={styles.NotepadSection}>
      <Header
        prefix={
          <Icon
            className="prefix"
            type={isOpen ? 'chevron-down' : 'chevron-right'}
            size={16}
            color="#392f41"
          />
        }
        title={
          <>
            笔记本
            <Icon
              type={'book'}
              size={16}
              color="#392f41"
              style={{ marginTop: 3, marginLeft: 5 }}
            />
          </>
        }
        suffix={
          <button onClick={() => createNotepad()}>
            <Icon type="plus" />
          </button>
        }
        onClick={() => setIsOpen((isOpen) => !isOpen)}
      />
      <Collapse isOpened={isOpen}>
        <div>
          {notepadStore.notepads.map((notepad) => (
            <Listitem
              key={notepad.id}
              style={{ height: 40, paddingLeft: 30, paddingRight: 20 }}
              onClick={() => configStore.setActive('notepad', notepad.id)}
              active={configStore.isActive('notepad', notepad.id)}
              activeBackground="#ddab87"
              onContextMenu={(e) => {
                show(e, { props: { notepadId: notepad.id } });
              }}
            >
              <span className="flex-row space-between">
                <span className="flex-1 text-ellipsis">{notepad.name}</span>
                <span style={{ textAlign: 'right', color: '#c55d5d' }}>
                  {noteStore.countsByNotepad[notepad.id] || 0}
                </span>
              </span>
            </Listitem>
          ))}
        </div>
      </Collapse>
      <Menu
        menuId={MENU_ID}
        menus={[
          {
            id: 'RENAME',
            title: '重命名',
          },
          {
            id: 'DELETE',
            title: '删除',
          },
        ]}
        onClick={handleMenuClick}
      ></Menu>
      <Confirm />
      <Prompt />
    </div>
  );
});

export default NotepadSection;
