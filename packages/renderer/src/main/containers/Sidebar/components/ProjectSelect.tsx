import type { FC } from 'react';
import React, { useState } from 'react';
import type { TabListProps } from '@fluentui/react-components';
import { TabList, Tab, makeStyles } from '@fluentui/react-components';
import {
  DeviceMeetingRoomRemoteRegular,
  FolderRegular,
} from '@fluentui/react-icons';
import LocalDirSelect from './local/LocalDirSelect';
import SSHProjectSelect from './ssh/SSHProjectSelect';
import View from '/@/components/View';
import GiteeProjectSelect from './gitee/GiteeProjectSelect';

export type Project = {
  type: 'local' | 'ssh' | 'gitee';
  config: any;
  rootUri: string;
};

const useStyles = makeStyles({
  tabContent: {
    paddingTop: '10px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
});

interface ProjectSelectProps {
  onSelect(project: Project): void;
}

const ProjectSelect: FC<ProjectSelectProps> = (props) => {
  const styles = useStyles();
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
        <Tab id="GITEE" icon={null} value="gitee">
          Gitee
        </Tab>
      </TabList>
      <div className={styles.tabContent}>
        {tab === 'local' && (
          <LocalDirSelect onOpen={(uri) => handleSelect('local', uri, null)} />
        )}
        {tab === 'ssh' && (
          <SSHProjectSelect
            onSelect={(uri, config) => handleSelect('ssh', uri, config)}
          />
        )}
        {tab === 'gitee' && (
          <GiteeProjectSelect
            onSelect={(uri, config) => handleSelect('gitee', uri, config)}
          />
        )}
      </div>
    </View>
  );
};

export default ProjectSelect;
