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
import { useEffect, useState, useCallback, useRef } from 'react';
import styles from './index.module.scss';

function QRCodePopover() {
  const { t } = useTranslation('common');
  const [url, setUrl] = useState('');
  const [visible, setVisible] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!visible) return;
    window.simmer.localIpV4().then((ip: string) => {
      setUrl(
        `http://${ip}:${stores.settingStore.settings['server.port']}/mobile?file=${stores.activationStore.activeFileUri}`,
      );
    });
  }, [visible, stores.activationStore.activeFileUri]);

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

  // 点击弹层外部关闭
  useEffect(() => {
    if (!visible) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(`.${styles.qrPopover}`) && !target.closest(`.${styles.qrTrigger}`)) {
        setVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [visible]);

  const togglePopover = useCallback(() => {
    setVisible((v) => {
      if (!v && btnRef.current) {
        const rect = btnRef.current.getBoundingClientRect();
        setPopoverPos({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
      }
      return !v;
    });
  }, []);

  return (
    <div
      className={styles.qrTrigger}
      onKeyDown={handleKeyDown}
    >
      <button
        ref={btnRef}
        type="button"
        className={styles.iconButton}
        aria-label={t('insertFile')}
        title={t('insertFileFromPhone')}
        onClick={togglePopover}
      >
        <QrCodeRegular />
      </button>

      {visible && (
        <div
          className={styles.qrPopover}
          style={{ top: popoverPos.top, right: popoverPos.right }}
        >
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
        <div className={styles.layoutGroup}>
          {(['split', 'editor-only', 'previewer-only'] as const).map((l) => (
            <button
              key={l}
              type="button"
              className={`${styles.layoutOption} ${layout === l ? styles.layoutOptionActive : ''}`}
              title={t('switchLayout')}
              onClick={() => stores.layoutStore.setLayout(l)}
            >
              {l === 'split' && <LayoutColumnTwoSplitLeftRegular />}
              {l === 'editor-only' && t('layoutEditorShort')}
              {l === 'previewer-only' && t('layoutPreviewShort')}
            </button>
          ))}
        </div>

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
