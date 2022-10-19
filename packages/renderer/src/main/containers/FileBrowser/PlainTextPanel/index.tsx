import type { FC } from 'react';
import React, { useRef } from 'react';
import MonacoEditor from '../../MonacoEditor/MonacoEditor';
import Flex from '/@/components/Flex';
import Icon from '/@/components/Icon';

interface PlainTextPanelProps {
  uri: string;
}

const PlainTextPanel: FC<PlainTextPanelProps> = (props) => {
  return (
    <Flex className="fullfill" flexDirection="column">
      <Flex
        justifyContent={'space-between'}
        boxShadow="#dddddd 0 6px 6px -6px"
        padding={'5px 10px'}
      >
        <div></div>
        <Flex paddingRight={10}>
          <Icon
            title="演示"
            type="play-btn-fill"
            onClick={() => window.simmer.showPreviewerWindow()}
          />
        </Flex>
      </Flex>
      <Flex position="relative" flex={1}>
        <MonacoEditor uri={props.uri} needLoad />
      </Flex>
    </Flex>
  );
};

export default PlainTextPanel;
