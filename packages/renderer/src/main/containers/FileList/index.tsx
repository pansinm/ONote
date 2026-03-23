import { observer } from 'mobx-react-lite';
import type { FC } from 'react';
import { useEffect, useMemo } from 'react';
import { useState } from 'react';
import React from 'react';
import { useContextMenu } from 'react-contexify';
import { useTranslation } from 'react-i18next';
import styles from './index.module.scss';
import stores from '../../stores';
import ListHeader from './ListHeader';
import ListItem from '/@/components/ListItem';
import type { MenuItem, MenuProps } from '/@/components/Menu';
import Menu from '/@/components/Menu';
import FileTreeItem from '/@/components/FileTreeItem';
import useFileOperation from '/@/hooks/useFileOperation';
import Flex from '/@/components/Flex';
import SearchList from './SearchList';
import type { TreeNode } from '@sinm/react-file-tree/lib/type';
import { useLatest } from 'react-use';
import { isEquals, resolveUri, pathanme, getParentUri } from '../../../common/utils/uri';
import { blobToBuffer } from '../../../common/utils/transform';
import fileService from '../../services/fileService';
import { FILE_CONTENT_CHANGED } from '../../eventbus/EventName';
import eventbus from '../../eventbus/eventbus';
import { getLogger } from '/@/shared/logger';

const logger = getLogger('FileList');

const MENU_ID = 'NOTE_MENU';

const FileList: FC = observer(() => {
  const { activationStore } = stores;
  const { t } = useTranslation('menu');

  const baseMenus: MenuItem[] = useMemo(() => [
    {
      id: 'CREATE_NOTE',
      title: t('createNote'),
    },
    {
      id: 'RENAME_NOTE',
      title: t('renameNote'),
    },
    {
      id: 'DELETE_NOTE',
      title: t('deleteNote'),
    },
    {
      id: 'COPY_PATH',
      title: t('copyPath'),
    },
    {
      id: 'EXPORT_PDF',
      title: t('exportPdf'),
    },
    {
      id: 'SORTER',
      title: t('fileSort'),
      children: [
        {
          id: 'SORTER_NAME_ASC',
          title: t('sortNameAsc'),
        },
        {
          id: 'SORTER_NAME_DESC',
          title: t('sortNameDesc'),
        },
        {
          id: 'SORTER_TIME_ASC',
          title: t('sortTimeAsc'),
        },
        {
          id: 'SORTER_TIME_DESC',
          title: t('sortTimeDesc'),
        },
      ],
    },
  ], [t]);

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
      alert(t('selectNotebook'));
    }
  };

  const handleMenuClick: MenuProps['onClick'] = async (menu, menuProps) => {
    const uri = (menuProps as any).uri;
    const SORTER_PREFIX = 'SORTER_';
    if (menu.id.startsWith(SORTER_PREFIX)) {
      stores.fileListStore.setSorter(
        menu.id
          .replace(SORTER_PREFIX, '')
          .replace('_', '-')
          .toLocaleLowerCase() as typeof stores.fileListStore.sorter,
      );
      return;
    }
    switch (menu.id) {
      case 'CREATE_NOTE':
        return createNote();
      case 'RENAME_NOTE':
        return renameFile(uri, 'file');
      case 'DELETE_NOTE':
        return deleteFile(uri, 'file');
      case 'COPY_PATH':
        return navigator.clipboard.writeText(
          decodeURIComponent(pathanme(uri)),
        );
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

  const [background, setBackground] = useState('transparent');
  const handleDragover = (event: React.DragEvent) => {
    setBackground('rgba(0,0,0,0.2)');
    event.preventDefault();
  };
  const handleDrop = (ev: React.DragEvent) => {
    if (!activationStore.activeDirUri) {
      alert(t('selectDirectory'));
      return;
    }
    setBackground('transparent');

    if (ev.dataTransfer.items) {
      [...ev.dataTransfer.items].forEach(async (item, i) => {
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) {
            const fileUri = resolveUri(
              activationStore.activeDirUri + '/',
              file.name,
            );
            fileService
              .writeFile(fileUri, await blobToBuffer(file))
              .then(() => {
                stores.fileListStore.refreshFiles();
              })
              .catch((error) => logger.error('Failed to write file', error));
          }
        }
      });
    } else {
      [...ev.dataTransfer.files].forEach((file, i) => {
        logger.debug('Dropped file', { index: i, fileName: file.name });
      });
    }
  };

  useEffect(() => {
    const handleFileContentChanged = (data: any) => {
      if (!data?.uri) {
        logger.debug('No URI in FILE_CONTENT_CHANGED event', { data });
        return;
      }

      if (!activationStore.activeDirUri) {
        return;
      }

      const isInCurrentDir = data.uri.startsWith(
        activationStore.activeDirUri + '/',
      );

      if (isInCurrentDir) {
        logger.debug(
          'File content changed in current directory, refreshing file list',
          {
            fileUri: data.uri,
            activeDirUri: activationStore.activeDirUri,
          },
        );

        stores.fileListStore.refreshFiles();
      }
    };

    eventbus.on(FILE_CONTENT_CHANGED, handleFileContentChanged);

    return () => {
      eventbus.off(FILE_CONTENT_CHANGED, handleFileContentChanged);
    };
  }, [activationStore.activeDirUri]);

  const menus = useMemo(() =>
    stores.activationStore.dataSourceId === 'local'
      ? [...baseMenus, { id: 'OPEN_FOLDER', title: t('openFolder') }]
      : baseMenus,
  [baseMenus, t]);

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
          onDragLeave={() => setBackground('transparent')}
          onDragOver={handleDragover}
          onDrop={handleDrop}
        >
          {stores.fileListStore.files.map((file) => (
            <ListItem
              key={file.uri}
              active={isEquals(activationStore.activeFileUri, file.uri)}
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
