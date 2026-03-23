import { Button } from '@fluentui/react-components';
import { Uri } from 'monaco-editor';
import type { FC } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface LocalDirSelectProps {
  onOpen(uri: string): void;
}

const LocalDirSelect: FC<LocalDirSelectProps> = (props) => {
  const { t } = useTranslation('common');
  const handleClick = () => {
    window.simmer.openDirectory().then((ret: any) => {
      const dir = ret.filePaths?.[0];
      if (dir) {
        const uri = Uri.file(dir).toString();
        props.onOpen(uri);
      }
    });
  };
  return (
    <div style={{ paddingTop: 10 }}>
      <Button appearance="primary" onClick={handleClick}>
        {t('openDirectory')}
      </Button>
    </div>
  );
};

export default LocalDirSelect;
