import React from 'react';
import { useTranslation } from 'react-i18next';
import QRCode from './QRCode';
import Flex from '/@/components/Flex';
import Icon from '/@/components/Icon';
import { observer } from 'mobx-react-lite';
import stores from '/@/main/stores';
import { LLM_BASE_URL } from '/@/common/constants/SettingKey';

interface ToolbarProps {
  isMarkdown?: boolean;
}

function Toolbar({ isMarkdown = true }: ToolbarProps) {
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
    <Flex
      justifyContent={'space-between'}
      boxShadow={isMarkdown ? '#dddddd 0 6px 6px -6px' : undefined}
      padding={'5px 10px'}
    >
      {isMarkdown && (
        <div>
          <QRCode />
        </div>
      )}
      <Flex paddingRight={10}>
        {isMarkdown && (
          <>
            <Icon
              title={t('switchLayout')}
              type="layout-split"
              size={18}
              onClick={() => stores.layoutStore.switchLayout()}
            />
            <Icon
              style={{ marginLeft: 10 }}
              title={t('demo')}
              type="play-btn"
              size={20}
              onClick={() => window.simmer.showPreviewerWindow()}
            />
          </>
        )}
        <span
          style={{
            marginLeft: isMarkdown ? 10 : 0,
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
      </Flex>
    </Flex>
  );
}

export default observer(Toolbar);
