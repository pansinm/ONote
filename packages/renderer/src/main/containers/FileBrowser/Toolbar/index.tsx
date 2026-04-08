import React from 'react';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';
import {
  QrCodeRegular,
  LayoutColumnTwoSplitLeftRegular,
  PlayRegular,
  ChatRegular,
} from '@fluentui/react-icons';
import { Tooltip } from '@fluentui/react-components';
import _QRCode from 'react-qr-code';
import stores from '/@/main/stores';
import { useEffect, useState } from 'react';

function QRCodePopover() {
  const { t } = useTranslation('common');
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
      positioning="below-start"
      content={visible ? (
        <div>
          <p style={{ fontSize: 13, marginBottom: 4 }}>{t('insertFileFromPhone')}</p>
          {url ? <_QRCode style={{ width: '100%' }} value={url} /> : <p>...</p>}
          <p style={{ fontSize: 12, color: '#888' }}>{url}</p>
        </div>
      ) : ''}
      relationship="description"
    >
      <QrCodeRegular style={{ fontSize: 18, cursor: 'pointer' }} title={t('insertFile')} />
    </Tooltip>
  );
}

const ObserverQRCodePopover = observer(QRCodePopover);

interface ToolbarActionsProps {
  isMarkdown?: boolean;
}

function ToolbarActions({ isMarkdown = true }: ToolbarActionsProps) {
  const { t } = useTranslation('common');
  const toggleChatBox = () => {
    const shown = stores.layoutStore.llmBoxVisible;
    if (shown) {
      stores.layoutStore.hideLLMBox();
    } else {
      stores.layoutStore.showLLMBox('llmbox');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        paddingRight: '10px',
        flexShrink: 0,
      }}
    >
      {isMarkdown && <ObserverQRCodePopover />}
      {isMarkdown && (
        <LayoutColumnTwoSplitLeftRegular
          style={{ fontSize: 18, cursor: 'pointer' }}
          title={t('switchLayout')}
          onClick={() => stores.layoutStore.switchLayout()}
        />
      )}
      {isMarkdown && (
        <PlayRegular
          style={{ fontSize: 18, cursor: 'pointer' }}
          title={t('demo')}
          onClick={() => window.simmer.showPreviewerWindow()}
        />
      )}
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLSpanElement).style.background =
            'rgba(0,0,0,0.05)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLSpanElement).style.background = 'none';
        }}
      >
        <ChatRegular
          style={{ fontSize: 18, cursor: 'pointer' }}
          title={t('chatGPT')}
          onClick={toggleChatBox}
        />
      </span>
    </div>
  );
}

export default observer(ToolbarActions);
