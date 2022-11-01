import type { FC } from 'react';
import { useState } from 'react';
import React from 'react';
import Button from '/@/components/Button';
import FileIcon from '/@/components/FileIcon';
import View from '/@/components/View';
import { basename } from '../../../../common/utils/uri';

interface UnSupportProps {
  uri: string;
}

const UnSupport: FC<UnSupportProps> = (props) => {
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
        <p>不支持当前文件格式</p>
        <Button disabled={opening} onClick={handleClick}>
          使用系统应用打开
        </Button>
      </View>
    </View>
  );
};

export default UnSupport;
