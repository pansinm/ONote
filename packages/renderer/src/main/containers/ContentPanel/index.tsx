import { observer } from 'mobx-react-lite';
import React from 'react';
import { Uri } from 'monaco-editor';
import ResourcePanel from '../FileBrowser';
import ResourceTabs from '../ResourceTabs';
import ToolbarActions from '../FileBrowser/Toolbar';
import stores from '../../stores';
import { isMarkdown } from '/@/common/utils/uri';
import { DocumentRegular, FolderOpenRegular } from '@fluentui/react-icons';
import { makeStyles, Button } from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import useFileOperation from '../../../hooks/useFileOperation';
import fileService from '../../services/fileService';

const useStyles = makeStyles({
  root: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  empty: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '16px',
    userSelect: 'none',
    padding: '24px',
  },
  emptyIcon: {
    color: '#c4b9a8',
  },
  emptyTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#5c5545',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: '13px',
    color: '#8c8275',
    textAlign: 'center',
    maxWidth: '360px',
    lineHeight: 1.6,
  },
  emptyActions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
});

const ContentPanel = observer(() => {
  const styles = useStyles();
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
              <Button
                appearance="primary"
                icon={<FolderOpenRegular />}
                onClick={() => {
                  void handleOpenDirectory().catch((error) => {
                    console.error('Failed to open directory from empty state', error);
                  });
                }}
              >
                {t('emptyStateOpenDirectoryNow')}
              </Button>
            ) : (
              <>
                <Button
                  appearance="primary"
                  onClick={() => {
                    void createFile(rootUri, 'file').catch((error) => {
                      console.error('Failed to create note from empty state', error);
                    });
                  }}
                >
                  {t('emptyStateCreateFirstNote')}
                </Button>
                <Button appearance="subtle" onClick={() => stores.activationStore.activeDir(rootUri)}>
                  {t('emptyStatePickFromSidebar')}
                </Button>
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
