import React, { useState } from 'react';
import {
  TabList,
  Tab,
  makeStyles,
  shorthands,
} from '@fluentui/react-components';
import PluginManager from './PluginManager';

const useStyles = makeStyles({
  root: {
    display: 'flex',
  },
  tabList: {
    ...shorthands.padding('10px', '5px'),
  },
  panel: {
    paddingLeft: '10px',
  },
});

export default function Setting() {
  const styles = useStyles();
  const [tab, setTab] = useState('plugin');
  return (
    <div className={styles.root}>
      <TabList
        className={styles.tabList}
        selectedValue={tab}
        onTabSelect={(e, data) => setTab(data.value as string)}
        vertical
      >
        <Tab value="plugin">插件管理</Tab>
      </TabList>
      <div className={styles.panel}>
        {tab === 'plugin' && <PluginManager />}
      </div>
    </div>
  );
}
