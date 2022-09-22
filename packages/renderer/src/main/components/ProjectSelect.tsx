import type { FC } from 'react';
import React, { useState } from 'react';
import LocalDirSelect from './LocalDirSelect';
import SSHProjectSelect from './SSHProjectSelect';
import Button from '/@/components/Button';
import View from '/@/components/View';

export type Project = {
  type: 'local' | 'ssh';
  config: any;
  rootUri: string;
};
interface ProjectSelectProps {
  onSelect(project: Project): void;
}

const ProjectSelect: FC<ProjectSelectProps> = (props) => {
  const [tab, setTab] = useState<Project['type']>('local');

  const handleSelect = async (type: typeof tab, uri: string, config: any) => {
    props.onSelect({
      type,
      config,
      rootUri: uri,
    });
  };

  return (
    <View flexDirection="column" height={300}>
      <View
        alignItems="center"
        borderBottom="1px solid gray"
        paddingBottom={10}
      >
        <Button onClick={() => setTab('local')}>本地</Button>
        <Button onClick={() => setTab('ssh')}>SSH</Button>
      </View>
      {tab === 'local' && (
        <LocalDirSelect onOpen={(uri) => handleSelect('local', uri, null)} />
      )}
      {tab === 'ssh' && (
        <SSHProjectSelect
          onSelect={(uri, config) => handleSelect('ssh', uri, config)}
        />
      )}
    </View>
  );
};

export default ProjectSelect;
