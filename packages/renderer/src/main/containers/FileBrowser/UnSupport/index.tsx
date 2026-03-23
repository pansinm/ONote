import type { FC } from 'react';
import { useState } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@fluentui/react-components';
import FileIcon from '/@/components/FileIcon';
import View from '/@/components/View';
import { basename } from '../../../../common/utils/uri';

interface UnSupportProps {
  uri: string;
}

const UnSupport: FC<UnSupportProps> = (props) => {
  const { t } = useTranslation('common');
  const [opening, setOpening] = useState(false);
  const handleClick = async () => {
    try {
      setOpening(true);
      await window.simmer.openExternal(props.uri);
    } finally {
      setOpening(false);
    }
  };
  return (
    <View
      flexDirection="column"
      flex={1}
      alignContent={'center'}
      justifyContent="center"
      className="fullfill"
      paddingBottom={'30%'}
    >
      <View flexDirection="column" alignItems={'center'}>
        <FileIcon size={40} uri={props.uri}></FileIcon>
        <p style={{ marginTop: 10 }}>{basename(props.uri)}</p>
        <p>{t('unsupportedFileFormat')}</p>
        <Button appearance="primary" disabled={opening} onClick={handleClick}>
          {t('openWithSystemApp')}
        </Button>
      </View>
    </View>
  );
};

export default UnSupport;
