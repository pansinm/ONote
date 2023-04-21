import React from 'react';
import QRCode from './QRCode';
import Flex from '/@/components/Flex';
import Icon from '/@/components/Icon';
import { observer } from 'mobx-react-lite';
import stores from '/@/main/stores';

function Toolbar() {
  const toggleChatBox = () => {
    const shown = stores.layoutStore.sidebarShown;
    if (shown) {
      stores.layoutStore.hideSidebar();
    } else {
      stores.layoutStore.showSidebar('https://chat.chatbot.sex/chat/');
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
          title="演示"
          type="play-btn"
          size={20}
          onClick={() => window.simmer.showPreviewerWindow()}
        />
        <Icon
          style={{ marginLeft: 10 }}
          title="ChatGPT"
          type="chat-dots"
          size={18}
          onClick={toggleChatBox}
        />
      </Flex>
    </Flex>
  );
}

export default observer(Toolbar);
