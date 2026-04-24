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
import SearchList from '../FileList/SearchList';
import type { TreeNode } from '@sinm/react-file-tree/lib/type';
import { useLatest } from 'react-use';
import useFileOperation from '/@/hooks/useFileOperation';

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
      <div className={styles.header}>
        <div className={styles.inputWrap}>
          <span className={styles.searchIcon}>
            <SearchRegular fontSize={12} />
          </span>
          <input
            id="sidebar-search-input"
            className={styles.searchInput}
            value={searchText}
            type="text"
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape' && searchText) {
                e.stopPropagation();
                setSearchText('');
                return;
              }

              if (e.key === 'ArrowDown' && searchFiles.length > 0) {
                e.preventDefault();
                const firstSearchResult = document.querySelector<HTMLElement>(
                  '[data-search-result-item="first"]',
                );
                firstSearchResult?.focus();
              }
            }}
            placeholder={t('searchShortcutHint', { ns: 'common' })}
          />
          {searchText && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={() => setSearchText('')}
              title={t('clearSearch')}
              aria-label={t('clearSearch')}
            >
              <DismissRegular fontSize={12} />
            </button>
          )}
        </div>
        <button
          type="button"
          className={styles.iconBtn}
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
          aria-label={t('createNote')}
        >
          <AddRegular fontSize={16} />
        </button>
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
