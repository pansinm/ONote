import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import styles from './index.module.scss';
import stores from '../../stores';
import Flex from '/@/components/Flex';
import Directory from './Directory';
import type { Project } from './components/ProjectSelect';
import { useLocalStorage } from 'react-use';
import fileService from '../../services/fileService';
import ProjectSelector from './ProjectSelector';
import SettingTrigger from '../Setting/SettingTrigger';
import { useTranslation } from 'react-i18next';
import {
  DismissRegular,
  SearchRegular,
  AddRegular,
} from '@fluentui/react-icons';
import { makeStyles, shorthands } from '@fluentui/react-components';
import SearchList from '../FileList/SearchList';
import type { TreeNode } from '@sinm/react-file-tree/lib/type';
import { useLatest } from 'react-use';
import useFileOperation from '/@/hooks/useFileOperation';

const useStyles = makeStyles({
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: '10px',
    gap: '4px',
  },
  inputWrap: {
    position: 'relative',
    ...shorthands.flex(1),
    minWidth: '50px',
  },
  searchIcon: {
    position: 'absolute',
    left: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#8a8886',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    height: '28px',
    ...shorthands.padding('5px', '28px', '5px', '28px'),
    ...shorthands.border('1px', 'solid', '#d3b17d'),
  },
  clearBtn: {
    position: 'absolute',
    right: '4px',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    cursor: 'pointer',
    color: '#8a8886',
    borderRadius: '2px',
    ':hover': {
      backgroundColor: 'rgba(0,0,0,0.06)',
      color: '#4a3f35',
    },
  },
  iconBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    cursor: 'pointer',
    borderRadius: '3px',
    ':hover': {
      backgroundColor: 'rgba(0,0,0,0.05)',
    },
  },
});

export default observer(function Sidebar() {
  const [open, setOpen] = useState(false);
  const [project, setProject] = useLocalStorage<
    | {
        type: 'local' | 'ssh' | 'gitee';
        config: any;
        rootUri: string;
      }
    | undefined
  >('project');

  const { t } = useTranslation('menu');
  const headerStyles = useStyles();
  const { createFile, Modal } = useFileOperation();

  // ===== 搜索功能 =====
  const [searchText, setSearchText] = useState('');
  const [searchFiles, setSearchFiles] = useState<TreeNode[]>([]);
  const latestText = useLatest(searchText);

  const search = async (keywords: string) => {
    try {
      const filterFiles = await fileService.searchFiles(
        stores.activationStore.rootUri,
        keywords,
      );
      if (keywords === latestText.current) {
        setSearchFiles(filterFiles);
      }
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    if (!searchText) {
      setSearchFiles([]);
    } else {
      search(searchText);
    }
  }, [searchText]);

  const isSearching = searchText.length > 0;

  const handleSelect = async (project: Project) => {
    try {
      await fileService.connect(project.type, project.config);
      stores.activationStore.openNoteBook(project.type, project.rootUri);
      fileService.setRootDirUri(project.rootUri);
      setProject(project);
      setOpen(false);
    } catch (err) {
      //ignore
    }
  };

  useEffect(() => {
    if (project) {
      handleSelect(project);
    }
  }, []);

  return (
    <div className={styles.Sidebar}>
      {/* 搜索头 */}
      <div className={headerStyles.header}>
        <div className={headerStyles.inputWrap}>
          <span className={headerStyles.searchIcon}>
            <SearchRegular fontSize={12} />
          </span>
          <input
            className={headerStyles.input}
            value={searchText}
            type="text"
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape' && searchText) {
                e.stopPropagation();
                setSearchText('');
              }
            }}
            placeholder={t('searchFiles')}
          />
          {searchText && (
            <span
              className={headerStyles.clearBtn}
              onClick={() => setSearchText('')}
              title={t('clearSearch')}
            >
              <DismissRegular fontSize={12} />
            </span>
          )}
        </div>
        <span
          className={headerStyles.iconBtn}
          onClick={() => {
            const dirUri =
              stores.activationStore.activeDirUri ||
              stores.activationStore.rootUri;
            if (dirUri) {
              createFile(dirUri, 'file').catch(() => {});
            }
          }}
          title={t('createNote')}
        >
          <AddRegular fontSize={16} style={{ color: '#5c5545' }} />
        </span>
      </div>

      {/* 目录/文件树 或 搜索结果 */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'auto' }}>
        {isSearching ? (
          <>
            <div className={styles.searchHeader}>
              {t('searchResults')} ({searchFiles.length})
            </div>
            {searchFiles.length === 0 ? (
              <div className={styles.noResults}>{t('noSearchResults')}</div>
            ) : (
              <SearchList
                files={searchFiles}
                activeUri={stores.activationStore.activeFileUri}
                onItemClick={(treeNode: TreeNode) => {
                  stores.activationStore.activeFile(treeNode.uri);
                  setSearchText('');
                }}
              />
            )}
          </>
        ) : (
          <Directory />
        )}
      </div>

      {/* 底部按钮 */}
      <Flex gap="4px">
        <ProjectSelector open={open} onOpenChange={setOpen} onSelected={handleSelect} />
        <SettingTrigger />
      </Flex>
      <Modal />
    </div>
  );
});
