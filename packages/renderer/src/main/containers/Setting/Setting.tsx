import React, { useState } from 'react';
import {
  TabList,
  Tab,
  makeStyles,
  shorthands,
} from '@fluentui/react-components';
import PluginManager from './PluginPanel/PluginManager';
import EditorPanel from './EditorPanel';
import PlantUMLPanel from './PlantUMLPanel';

const useStyles = makeStyles({
  root: {
    display: 'flex',
  },
  tabList: {
    width: '120px',
    ...shorthands.padding('10px', '5px'),
    ...shorthands.borderRight('1px', 'solid'),
  },
  panel: {
    paddingLeft: '10px',
    ...shorthands.flex(1),
  },
});

export default function Setting() {
  const styles = useStyles();
  const [tab, setTab] = useState('editor');
  return (
    <div className={styles.root}>
      <TabList
        className={styles.tabList}
        selectedValue={tab}
        onTabSelect={(e, data) => setTab(data.value as string)}
        vertical
      >
        <Tab value="editor">编辑器</Tab>
        <Tab value="plantuml">PlantUML</Tab>
        <Tab value="plugin">插件管理</Tab>
      </TabList>
      <div className={styles.panel}>
        {tab === 'editor' && <EditorPanel />}
        {tab === 'plantuml' && <PlantUMLPanel />}
        {tab === 'plugin' && <PluginManager />}
      </div>
    </div>
  );
}
