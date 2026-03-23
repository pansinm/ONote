import React from 'react';
import { useTranslation } from 'react-i18next';
import QRCode from './QRCode';
import Flex from '/@/components/Flex';
import Icon from '/@/components/Icon';
import { observer } from 'mobx-react-lite';
import stores from '/@/main/stores';
import { LLM_BASE_URL } from '/@/common/constants/SettingKey';

function Toolbar() {
  const { t } = useTranslation('common');
  const toggleChatBox = () => {
    const shown = stores.layoutStore.sidebarShown;
    if (shown) {
      stores.layoutStore.hideSidebar();
    } else {
      const url = './llmbox.html';
      if (url) {
        stores.layoutStore.showSidebar(url);
      } else {
        alert(t('configureLLMApiUrlFirst'));
      }
    }
  };
  return (
    <Flex
      justifyContent={'space-between'}
      boxShadow="#dddddd 0 6px 6px -6px"
      padding={'5px 10px'}
    >
      <div>
        <QRCode />
      </div>
      <Flex paddingRight={10}>
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
        <Icon
          style={{ marginLeft: 10, marginTop: 1 }}
          title={t('chatGPT')}
          type="chat-dots"
          size={18}
          onClick={toggleChatBox}
        />
      </Flex>
    </Flex>
  );
}

export default observer(Toolbar);
