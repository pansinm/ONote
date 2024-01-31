import type { FC } from 'react';
import React, { useState } from 'react';
import fileService from '../../../../services/fileService';
import SSHDirSelect from './SSHDirSelect';
import type { SSHFormProps } from './SSHForm';
import SSHForm from './SSHForm';
import View from '/@/components/View';

interface SSHProjectSelectProps {
  onSelect(uri: string, config: any): void;
}

const SSHProjectSelect: FC<SSHProjectSelectProps> = (props) => {
  const [type, setType] = useState<'connect' | 'dir'>('connect');
  const [config, setConfig] = useState<any>({});

  const handleSubmit: SSHFormProps['onSubmit'] = async (data) => {
    const { config, providerId: providerId } = await fileService.getProvider();
    try {
      await fileService.connect('ssh', data);
      setType('dir');
      setConfig(data);
    } catch (err) {
      alert((err as Error).message);
      fileService.connect(providerId, config);
      console.error(err);
    }
  };

  return (
    <View flex={1} flexDirection="column">
      {type === 'connect' ? (
        <SSHForm onSubmit={handleSubmit} />
      ) : (
        <SSHDirSelect
          onOpen={(selectedUri) => props.onSelect(selectedUri, config)}
        />
      )}
    </View>
  );
};

export default SSHProjectSelect;
