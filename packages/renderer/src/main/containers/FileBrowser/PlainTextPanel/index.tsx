import type { FC } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { PlayRegular } from '@fluentui/react-icons';
import MonacoEditor from '../../MonacoEditor/MonacoEditor';
import Flex from '/@/components/Flex';

interface PlainTextPanelProps {
  uri: string;
}

const PlainTextPanel: FC<PlainTextPanelProps> = (props) => {
  const { t } = useTranslation('common');
  return (
    <Flex className="fullfill" flexDirection="column">
      <Flex
        justifyContent={'space-between'}
        boxShadow="#dddddd 0 6px 6px -6px"
        padding={'5px 10px'}
      >
        <div></div>
        <Flex paddingRight={10}>
          <PlayRegular
            title={t('demo')}
            style={{ fontSize: 18, cursor: 'pointer', color: '#5c5545' }}
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
