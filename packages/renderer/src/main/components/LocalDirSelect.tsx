import { Uri } from 'monaco-editor';
import type { FC } from 'react';
import React from 'react';
import Button from '/@/components/Button';

interface LocalDirSelectProps {
  onOpen(uri: string): void;
}

const LocalDirSelect: FC<LocalDirSelectProps> = (props) => {
  const handleClick = () => {
    window.simmer.openDirectory().then((ret) => {
      const dir = ret.filePaths?.[0];
      if (dir) {
        const uri = Uri.file(dir).toString();
        props.onOpen(uri);
      }
    });
  };
  return (
    <div style={{ paddingTop: 10 }}>
      <Button onClick={handleClick}>打开目录</Button>
    </div>
  );
};

export default LocalDirSelect;
