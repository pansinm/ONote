import type { FC } from 'react';
import React, { useState } from 'react';
import fileService from '../../../../services/fileService';
import View from '/@/components/View';
import type { GiteeFormProps } from './GiteeForm';
import GiteeForm from './GiteeForm';
import GiteeDirSelect from './GiteeDirSelect';
import { getLogger } from '/@/shared/logger';

const logger = getLogger('GiteeProjectSelect');

interface SSHProjectSelectProps {
  onSelect(uri: string, config: any): void;
}

const GiteeProjectSelect: FC<SSHProjectSelectProps> = (props) => {
  const [type, setType] = useState<'connect' | 'dir'>('connect');
  const [config, setConfig] = useState<any>({});

  const handleSubmit: GiteeFormProps['onSubmit'] = async (data) => {
    const { config, providerId: providerId } = await fileService.getProvider();
    try {
      await fileService.connect('gitee', data);
      setType('dir');
      setConfig(data);
    } catch (err) {
      alert((err as Error).message);
      fileService.connect(providerId, config);
      logger.error('Failed to connect Gitee', err);
    }
  };

  return (
    <View flex={1} flexDirection="column">
      {type === 'connect' ? (
        <GiteeForm onSubmit={handleSubmit} />
      ) : (
        <GiteeDirSelect
          onOpen={(selectedUri) => props.onSelect(selectedUri, config)}
        />
      )}
    </View>
  );
};

export default GiteeProjectSelect;
