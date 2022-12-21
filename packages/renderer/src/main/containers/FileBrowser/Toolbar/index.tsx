import React from 'react';
import QRCode from './QRCode';
import Flex from '/@/components/Flex';
import Icon from '/@/components/Icon';

function Toolbar() {
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
          type="play-btn-fill"
          onClick={() => window.simmer.showPreviewerWindow()}
        />
      </Flex>
    </Flex>
  );
}

export default Toolbar;
