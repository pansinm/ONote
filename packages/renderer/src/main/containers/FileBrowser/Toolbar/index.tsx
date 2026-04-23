import React from 'react';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';
import {
  QrCodeRegular,
  LayoutColumnTwoSplitLeftRegular,
  PlayRegular,
} from '@fluentui/react-icons';
import {
  Tooltip,
  Button,
  makeStyles,
  tokens,
  Divider,
} from '@fluentui/react-components';
import _QRCode from 'react-qr-code';
import stores from '/@/main/stores';
import { useEffect, useMemo, useState } from 'react';

const useStyles = makeStyles({
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    paddingRight: '10px',
    flexShrink: 0,
  },
  primaryGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  secondaryGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    opacity: 0.82,
  },
  divider: {
    height: '20px',
  },
  statusButton: {
    minWidth: 'unset',
    paddingLeft: '10px',
    paddingRight: '10px',
    color: '#4a3f35',
  },
  iconButton: {
    minWidth: '32px',
    width: '32px',
    height: '32px',
  },
  qrWrap: {
    maxWidth: '220px',
  },
  qrHint: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
    wordBreak: 'break-all',
    marginTop: '8px',
  },
});

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
  const styles = useStyles();
  const [url, setUrl] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!visible) return;
    window.simmer.localIpV4().then((ip: string) => {
      setUrl(
        `http://${ip}:${stores.settingStore.settings['server.port']}/mobile?file=${stores.activationStore.activeFileUri}`,
      );
    });
  }, [visible, stores.activationStore.activeFileUri]);

  return (
    <Tooltip
      withArrow
      onVisibleChange={(_e, data) => setVisible(data.visible)}
      positioning="below-end"
      content={
        visible ? (
          <div className={styles.qrWrap}>
            <p style={{ fontSize: 13, marginBottom: 6 }}>{t('insertFileFromPhone')}</p>
            {url ? <_QRCode style={{ width: '100%' }} value={url} /> : <p>...</p>}
            <p className={styles.qrHint}>{url}</p>
          </div>
        ) : (
          ''
        )
      }
      relationship="description"
    >
      <Button
        appearance="subtle"
        icon={<QrCodeRegular />}
        className={styles.iconButton}
        aria-label={t('insertFile')}
      />
    </Tooltip>
  );
}

const ObserverQRCodePopover = observer(QRCodePopover);

interface ToolbarActionsProps {
  isMarkdown?: boolean;
}

function ToolbarActions({ isMarkdown = true }: ToolbarActionsProps) {
  const { t } = useTranslation('common');
  const styles = useStyles();
  const layout = stores.layoutStore.layout;
  const currentLayout = useMemo(() => getLayoutLabel(t, layout), [t, layout]);
  const nextLayout = useMemo(
    () => getLayoutLabel(t, getNextLayout(layout)),
    [t, layout],
  );

  if (!isMarkdown) {
    return (
      <div className={styles.toolbar}>
        <Tooltip withArrow content={t('openInNewPreview')} relationship="description">
          <Button
            appearance="subtle"
            icon={<PlayRegular />}
            className={styles.iconButton}
            aria-label={t('openInNewPreview')}
            onClick={() => window.simmer.showPreviewerWindow()}
          />
        </Tooltip>
      </div>
    );
  }

  return (
    <div className={styles.toolbar}>
      <div className={styles.primaryGroup}>
        <Tooltip
          withArrow
          content={`${t('layoutCurrent', { layout: currentLayout })} · ${t('layoutNext', {
            layout: nextLayout,
          })}`}
          relationship="description"
        >
          <Button
            appearance="secondary"
            className={styles.statusButton}
            icon={<LayoutColumnTwoSplitLeftRegular />}
            onClick={() => stores.layoutStore.switchLayout()}
          >
            {currentLayout}
          </Button>
        </Tooltip>

        <Tooltip withArrow content={t('openInNewPreview')} relationship="description">
          <Button
            appearance="subtle"
            icon={<PlayRegular />}
            className={styles.iconButton}
            aria-label={t('openInNewPreview')}
            onClick={() => window.simmer.showPreviewerWindow()}
          />
        </Tooltip>
      </div>

      <Divider vertical className={styles.divider} />

      <div className={styles.secondaryGroup}>
        <ObserverQRCodePopover />
      </div>
    </div>
  );
}

export default observer(ToolbarActions);
