import React from 'react';
import { useTranslation } from 'react-i18next';
import QRCode from './QRCode';
import Icon from '/@/components/Icon';
import { observer } from 'mobx-react-lite';
import stores from '/@/main/stores';

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
      {isMarkdown && <QRCode />}
      {isMarkdown && (
        <Icon
          title={t('switchLayout')}
          type="layout-split"
          size={18}
          onClick={() => stores.layoutStore.switchLayout()}
        />
      )}
      {isMarkdown && (
        <Icon
          title={t('demo')}
          type="play-btn"
          size={20}
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
        <Icon
          style={{ marginTop: 1 }}
          title={t('chatGPT')}
          type="chat-dots"
          size={20}
          onClick={toggleChatBox}
        />
      </span>
    </div>
  );
}

export default observer(ToolbarActions);
