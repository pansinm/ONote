import React from 'react';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';
import {
  QrCodeRegular,
  LayoutColumnTwoSplitLeftRegular,
  PlayRegular,
} from '@fluentui/react-icons';
import _QRCode from 'react-qr-code';
import stores from '/@/main/stores';
import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import styles from './index.module.scss';

function getLayoutLabel(t: (key: string, options?: any) => string, layout: string) {
  switch (layout) {
    case 'editor-only':
      return t('layoutEditorOnly');
    case 'previewer-only':
      return t('layoutPreviewOnly');
    case 'split':
    default:
      return t('layoutSplit');
  }
}

function getNextLayout(layout: string) {
  switch (layout) {
    case 'split':
      return 'editor-only';
    case 'editor-only':
      return 'previewer-only';
    default:
      return 'split';
  }
}

function QRCodePopover() {
  const { t } = useTranslation('common');
  const [url, setUrl] = useState('');
  const [visible, setVisible] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible) return;
    window.simmer.localIpV4().then((ip: string) => {
      setUrl(
        `http://${ip}:${stores.settingStore.settings['server.port']}/mobile?file=${stores.activationStore.activeFileUri}`,
      );
    });
  }, [visible, stores.activationStore.activeFileUri]);

  const handleMouseEnter = useCallback(() => setVisible(true), []);
  const handleMouseLeave = useCallback(() => setVisible(false), []);

  // 键盘 Escape 关闭弹层
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape' && visible) {
        e.stopPropagation();
        setVisible(false);
      }
    },
    [visible],
  );

  return (
    <div
      ref={popoverRef}
      className={styles.qrTrigger}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        className={styles.iconButton}
        aria-label={t('insertFile')}
        title={t('insertFileFromPhone')}
        onClick={() => setVisible((v) => !v)}
      >
        <QrCodeRegular />
      </button>

      {visible && (
        <div className={styles.qrPopover}>
          <div className={styles.qrWrap}>
            <p className={styles.qrTitle}>{t('insertFileFromPhone')}</p>
            {url ? <_QRCode style={{ width: '100%' }} value={url} /> : <p>...</p>}
            <p className={styles.qrHint}>{url}</p>
          </div>
        </div>
      )}
    </div>
  );
}

const ObserverQRCodePopover = observer(QRCodePopover);

interface ToolbarActionsProps {
  isMarkdown?: boolean;
}

function ToolbarActions({ isMarkdown = true }: ToolbarActionsProps) {
  const { t } = useTranslation('common');
  const layout = stores.layoutStore.layout;
  const currentLayout = useMemo(() => getLayoutLabel(t, layout), [t, layout]);
  const nextLayout = useMemo(
    () => getLayoutLabel(t, getNextLayout(layout)),
    [t, layout],
  );

  if (!isMarkdown) {
    return (
      <div className={styles.toolbar}>
        <button
          type="button"
          className={styles.iconButton}
          title={t('openInNewPreview')}
          aria-label={t('openInNewPreview')}
          onClick={() => window.simmer.showPreviewerWindow()}
        >
          <PlayRegular />
        </button>
      </div>
    );
  }

  return (
    <div className={styles.toolbar}>
      <div className={styles.primaryGroup}>
        <button
          type="button"
          className={styles.statusButton}
          title={`${t('layoutCurrent', { layout: currentLayout })} · ${t('layoutNext', {
            layout: nextLayout,
          })}`}
          onClick={() => stores.layoutStore.switchLayout()}
        >
          <LayoutColumnTwoSplitLeftRegular />
          {currentLayout}
        </button>

        <button
          type="button"
          className={styles.iconButton}
          title={t('openInNewPreview')}
          aria-label={t('openInNewPreview')}
          onClick={() => window.simmer.showPreviewerWindow()}
        >
          <PlayRegular />
        </button>
      </div>

      <div className={styles.divider} />

      <div className={styles.secondaryGroup}>
        <ObserverQRCodePopover />
      </div>
    </div>
  );
}

export default observer(ToolbarActions);
