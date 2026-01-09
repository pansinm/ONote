import { Button } from '@fluentui/react-components';
import { Uri } from 'monaco-editor';
import type { FC } from 'react';
import React from 'react';

interface LocalDirSelectProps {
  onOpen(uri: string): void;
}

const LocalDirSelect: FC<LocalDirSelectProps> = (props) => {
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
        打开目录
      </Button>
    </div>
  );
};

export default LocalDirSelect;
