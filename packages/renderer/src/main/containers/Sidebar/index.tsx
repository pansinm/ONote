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
import { makeStyles, shorthands, Tooltip } from '@fluentui/react-components';
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

  const { t } = useTranslation(['menu', 'common']);
  const headerStyles = useStyles();
  const { createFile, Modal } = useFileOperation();

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
      setSearchText('');
      setSearchFiles([]);
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
      <div className={headerStyles.header}>
        <div className={headerStyles.inputWrap}>
          <span className={headerStyles.searchIcon}>
            <SearchRegular fontSize={12} />
          </span>
          <input
            id="sidebar-search-input"
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
            placeholder={t('searchShortcutHint', { ns: 'common' })}
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
        <Tooltip content={t('createNote')} relationship="description" withArrow>
          <span
            className={headerStyles.iconBtn}
            onClick={() => {
              const dirUri =
                stores.activationStore.activeDirUri ||
                stores.activationStore.rootUri;
              if (dirUri) {
                void createFile(dirUri, 'file').catch((error) => {
                  console.error('Failed to create note from sidebar', error);
                });
              }
            }}
            title={t('createNote')}
          >
            <AddRegular fontSize={16} style={{ color: '#5c5545' }} />
          </span>
        </Tooltip>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        {isSearching && (
          <div className={styles.searchPanel}>
            <div className={styles.searchHeaderRow}>
              <div>
                <div className={styles.searchHeader}>{t('searchResults')}</div>
                <div className={styles.searchHint}>
                  {searchFiles.length > 0
                    ? t('searchResultsHint', { ns: 'common', count: searchFiles.length })
                    : t('searchOpenToEdit')}
                </div>
              </div>
              <span className={styles.searchHint}>{t('searchKeepsTreeVisible')}</span>
            </div>
            {searchFiles.length === 0 ? (
              <div className={styles.noResults}>{t('noSearchResults')}</div>
            ) : (
              <div className={styles.searchResultsList}>
                <SearchList
                  files={searchFiles}
                  keyword={searchText}
                  rootUri={stores.activationStore.rootUri}
                  activeUri={stores.activationStore.activeFileUri}
                  onItemClick={(treeNode: TreeNode) => {
                    stores.activationStore.activeFile(treeNode.uri);
                    setSearchText('');
                  }}
                />
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'auto' }}>
          <Directory />
        </div>
      </div>

      <Flex gap="4px">
        <ProjectSelector open={open} onOpenChange={setOpen} onSelected={handleSelect} />
        <SettingTrigger />
      </Flex>
      <Modal />
    </div>
  );
});
