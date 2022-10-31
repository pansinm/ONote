import type { FC } from 'react';
import React, { useState } from 'react';
import type { TabListProps } from '@fluentui/react-components';
import { webLightTheme } from '@fluentui/react-components';
import { FluentProvider } from '@fluentui/react-components';
import { TabList, Tab } from '@fluentui/react-components';
import {
  DeviceMeetingRoomRemoteRegular,
  FolderRegular,
} from '@fluentui/react-icons';
import LocalDirSelect from './LocalDirSelect';
import SSHProjectSelect from './SSHProjectSelect';
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

  const handleTabSelect: TabListProps['onTabSelect'] = (event, data) => {
    setTab((data as any).value);
  };

  return (
    <View flexDirection="column" height={300}>
      <TabList selectedValue={tab} onTabSelect={handleTabSelect}>
        <Tab id="Local" icon={<FolderRegular />} value="local">
          本地
        </Tab>
        <Tab id="SSH" icon={<DeviceMeetingRoomRemoteRegular />} value="ssh">
          SSH
        </Tab>
      </TabList>
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
