import { observer } from 'mobx-react-lite';
import React from 'react';
import { Uri } from 'monaco-editor';
import ResourcePanel from '../FileBrowser';
import ResourceTabs from '../ResourceTabs';
import ToolbarActions from '../FileBrowser/Toolbar';
import stores from '../../stores';
import { isMarkdown } from '/@/common/utils/uri';
import { DocumentRegular, FolderOpenRegular } from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';
import useFileOperation from '../../../hooks/useFileOperation';
import fileService from '../../services/fileService';
import styles from './index.module.scss';

const ContentPanel = observer(() => {
  const { t } = useTranslation(['common', 'menu']);
  const { createFile, Modal } = useFileOperation();

  const handleOpenDirectory = async () => {
    const ret = await window.simmer.openDirectory();
    const dir = ret.filePaths?.[0];
    if (!dir) return;

    const rootUri = Uri.file(dir).toString();
    await fileService.connect('local', null);
    stores.activationStore.openNoteBook('local', rootUri);
    fileService.setRootDirUri(rootUri);
  };

  if (!stores.activationStore.openedFiles.length) {
    const rootUri = stores.activationStore.rootUri;
    const hasDirectory = Boolean(rootUri);

    return (
      <>
        <div className={styles.empty}>
          <DocumentRegular className={styles.emptyIcon} style={{ fontSize: '48px' }} />
          <div className={styles.emptyTitle}>
            {hasDirectory
              ? t('emptyStateTitleNoFile')
              : t('emptyStateTitleNoDirectory')}
          </div>
          <div className={styles.emptySubtext}>
            {hasDirectory
              ? t('emptyStateDescNoFile')
              : t('emptyStateDescNoDirectory')}
          </div>
          <div className={styles.emptyActions}>
            {!hasDirectory ? (
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => {
                  void handleOpenDirectory().catch((error) => {
                    console.error('Failed to open directory from empty state', error);
                  });
                }}
              >
                <FolderOpenRegular />
                {t('emptyStateOpenDirectoryNow')}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={() => {
                    void createFile(rootUri, 'file').catch((error) => {
                      console.error('Failed to create note from empty state', error);
                    });
                  }}
                >
                  {t('emptyStateCreateFirstNote')}
                </button>
                <button
                  type="button"
                  className={styles.subtleButton}
                  onClick={() => {
                    stores.activationStore.activeDir(rootUri);
                    if (stores.activationStore.hideSidebar) {
                      stores.activationStore.toggleSidebar();
                    }
                  }}
                >
                  {t('emptyStatePickFromSidebar')}
                </button>
              </>
            )}
          </div>
        </div>
        <Modal />
      </>
    );
  }

  const activeFileUri = stores.activationStore.activeFileUri;
  const currentIsMarkdown = activeFileUri ? isMarkdown(activeFileUri) : true;

  return (
    <div className={styles.root}>
      <ResourceTabs pinnedRight={<ToolbarActions isMarkdown={currentIsMarkdown} />} />
      <div style={{ flex: 1, position: 'relative' }}>
        <ResourcePanel />
      </div>
    </div>
  );
});

export default ContentPanel;
