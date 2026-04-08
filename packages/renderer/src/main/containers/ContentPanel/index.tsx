import { observer } from 'mobx-react-lite';
import React from 'react';
import ResourcePanel from '../FileBrowser';
import ResourceTabs from '../ResourceTabs';
import ToolbarActions from '../FileBrowser/Toolbar';
import stores from '../../stores';
import { isMarkdown } from '/@/common/utils/uri';
import { DocumentRegular } from '@fluentui/react-icons';
import { makeStyles, Button } from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import useFileOperation from '../../../hooks/useFileOperation';

const useStyles = makeStyles({
  empty: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '16px',
    userSelect: 'none',
  },
  emptyIcon: {
    color: '#c8c6c4',
  },
  emptyText: {
    fontSize: '14px',
    color: '#605e5c',
  },
});

const ContentPanel = observer(() => {
  const styles = useStyles();
  const { t } = useTranslation('common');
  const { createFile, Modal } = useFileOperation();

  if (!stores.activationStore.openedFiles.length) {
    const rootUri = stores.activationStore.rootUri;
    return (
      <>
        <div className={styles.empty}>
          <DocumentRegular className={styles.emptyIcon} style={{ fontSize: '48px' }} />
          <span className={styles.emptyText}>{t('emptyStateHint')}</span>
          {!rootUri && (
            <span className={styles.emptyText}>{t('menu:openFolderHint')}</span>
          )}
          {rootUri && (
            <Button
              appearance="subtle"
              onClick={() => createFile(rootUri, 'file').catch(() => {})}
            >
              {t('menu:createNote')}
            </Button>
          )}
        </div>
        <Modal />
      </>
    );
  }

  const activeFileUri = stores.activationStore.activeFileUri;
  const currentIsMarkdown = activeFileUri ? isMarkdown(activeFileUri) : true;

  return (
    <div className="fullfill" style={{ display: 'flex', flexDirection: 'column' }}>
      <ResourceTabs pinnedRight={<ToolbarActions isMarkdown={currentIsMarkdown} />} />
      <div style={{ flex: 1, position: 'relative' }}>
        <ResourcePanel />
      </div>
    </div>
  );
});

export default ContentPanel;
