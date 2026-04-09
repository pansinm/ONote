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
  },
  emptyIcon: {
    color: '#c4b9a8',
  },
  emptyText: {
    fontSize: '14px',
    color: '#7a6e60',
  },
  emptySubtext: {
    fontSize: '13px',
    color: '#b0aaa0',
    textAlign: 'center',
    maxWidth: '260px',
    lineHeight: 1.5,
  },
  // 悬浮 AI 助手入口按钮
  aiFab: {
    position: 'absolute',
    bottom: '16px',
    right: '16px',
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    border: '1px solid var(--warm-border)',
    backgroundColor: '#faf6ee',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    transition: 'background-color 0.15s, box-shadow 0.15s, transform 0.1s',
    zIndex: 100,
    '&:hover': {
      backgroundColor: '#f0ebe0',
      boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
      transform: 'scale(1.05)',
    },
  },
  aiFabIcon: {
    color: 'var(--warm-accent)',
    fontSize: '18px',
    lineHeight: 1,
  },
});

const ContentPanel = observer(() => {
  const styles = useStyles();
  const { t } = useTranslation('common');
  const { createFile, Modal } = useFileOperation();

  const showAiFab = stores.layoutStore.llmBoxVisible === false;

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
          <span className={styles.emptySubtext}>
            {t('aiAssistantHint')}
          </span>
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
        {/* 悬浮 AI 助手入口 */}
        {showAiFab && (
          <button
            className={styles.aiFab}
            onClick={() => stores.layoutStore.showLLMBox('llmbox')}
            title={t('openAiAssistant')}
            type="button"
          >
            <span className={styles.aiFabIcon}>✦</span>
          </button>
        )}
      </div>
    </div>
  );
});

export default ContentPanel;
