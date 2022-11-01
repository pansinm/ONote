import { observer } from 'mobx-react-lite';
import type { FC } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import React from 'react';
import styles from './index.module.scss';
import stores from '../../stores';
import ListHeader from './ListHeader';
import ListItem from '/@/components/ListItem';
import type { MenuItem, MenuProps } from '/@/components/Menu';
import Menu from '/@/components/Menu';
import { useContextMenu } from 'react-contexify';
import FileTreeItem from '/@/components/FileTreeItem';
import useFileOperation from '/@/hooks/useFileOperation';
import Flex from '/@/components/Flex';
import SearchList from './SearchList';
import type { TreeNode } from '@sinm/react-file-tree/lib/type';
import { useLatest, usePrevious } from 'react-use';
import { resolveUri } from '../../../common/utils/uri';
import { blobToBuffer } from '../../../common/utils/transform';
import fileService from '../../services/fileService';

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

const FileList: FC = observer(() => {
  const { activationStore } = stores;

  const [text, setText] = useState('');
  const [files, setFiles] = useState<TreeNode[]>([]);

  const { show: showMenu } = useContextMenu({
    id: MENU_ID,
  });

  const latestText = useLatest(text);

  const search = async (keywords: string) => {
    try {
      const filterFiles = await fileService.searchFiles(
        activationStore.rootUri,
        keywords,
      );
      if (keywords === latestText.current) {
        setFiles(filterFiles);
      }
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    console.log(text);
    if (!text) {
      setFiles([]);
    } else {
      search(text);
    }
  }, [text]);

  const { Modal, createFile, deleteFile, renameFile } = useFileOperation();

  const createNote = () => {
    if (stores.activationStore.activeDirUri) {
      createFile(stores.activationStore.activeDirUri, 'file');
    } else {
      alert('请选中笔记本');
    }
  };

  const handleMenuClick: MenuProps['onClick'] = async (menu, menuProps) => {
    const uri = (menuProps as any).uri;
    switch (menu.id) {
      case 'CREATE_NOTE':
        return createNote();
      case 'RENAME_NOTE':
        return renameFile(uri, 'file');
      case 'DELETE_NOTE':
        return deleteFile(uri, 'file');
      default:
        return;
    }
  };

  const [background, setBackground] = useState('transparent');
  const handleDragover = (event: React.DragEvent) => {
    setBackground('rgba(0,0,0,0.2)');
    event.preventDefault();
  };
  const handleDrop = (ev: React.DragEvent) => {
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
    if (!activationStore.activeDirUri) {
      alert('先打开目录');
      return;
    }
    setBackground('transparent');

    if (ev.dataTransfer.items) {
      // Use DataTransferItemList interface to access the file(s)
      [...ev.dataTransfer.items].forEach(async (item, i) => {
        // If dropped items aren't files, reject them
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) {
            const fileUri = resolveUri(
              activationStore.activeDirUri + '/',
              file.name,
            );
            console.log(fileUri);
            fileService
              .writeFile(fileUri, await blobToBuffer(file))
              .then(() => {
                stores.fileListStore.refreshFiles();
              })
              .catch(console.log);
          }
        }
      });
    } else {
      // Use DataTransfer interface to access the file(s)
      [...ev.dataTransfer.files].forEach((file, i) => {
        console.log(`… file[${i}].name = ${file.name}`);
      });
    }
  };
  return (
    <Flex flexDirection="column" className={styles.NoteList}>
      <ListHeader
        searchText={text}
        onTextChange={setText}
        onNoteCreate={createNote}
        onPrefixIconClick={() => stores.activationStore.toggleSidebar()}
      />
      <Flex flex={1} flexDirection="column" overflow="auto">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            background,
          }}
          draggable
          // onDragEnter={() => setBackground('rgba(0,0,0,0.2)')}
          onDragLeave={() => setBackground('transparent')}
          onDragOver={handleDragover}
          onDrop={handleDrop}
        >
          {stores.fileListStore.files.map((file) => (
            <ListItem
              key={file.uri}
              active={activationStore.activeFileUri === file.uri}
              onContextMenu={(e) => {
                showMenu(e, { props: { uri: file.uri } });
              }}
              onClick={() => {
                stores.activationStore.activeFile(file.uri);
              }}
              onClose={() => {
                deleteFile(file.uri, 'file');
              }}
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', file.uri);
              }}
            >
              <FileTreeItem treeNode={file} active={false} />
            </ListItem>
          ))}
        </div>
        {text && (
          <Flex
            background={'rgba(0,0,0,0.5)'}
            position="absolute"
            flexDirection="column"
            left={0}
            right={0}
            height={'100%'}
            className="search-container"
            onClick={(e) => {
              if (
                (e.target as HTMLDivElement).classList.contains(
                  'search-container',
                )
              ) {
                setText('');
              }
            }}
          >
            <SearchList
              style={{ maxHeight: '70%', overflow: 'auto' }}
              files={files}
              activeUri={stores.activationStore.activeFileUri}
              onItemClick={(treeNode: TreeNode) => {
                stores.activationStore.activeFile(treeNode.uri);
              }}
            ></SearchList>
          </Flex>
        )}
      </Flex>

      <Menu menuId={MENU_ID} menus={menus} onClick={handleMenuClick} />
      <Modal />
    </Flex>
  );
});

export default FileList;
