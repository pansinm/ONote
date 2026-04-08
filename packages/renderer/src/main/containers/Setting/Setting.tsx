import React, { useState } from 'react';
import {
  TabList,
  Tab,
  makeStyles,
  shorthands,
} from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';
// Plugin 面板暂时隐藏——插件系统未实现，不可用的入口是认知负债
// import PluginManager from './PluginPanel/PluginManager';
import EditorPanel from './EditorPanel';
import PlantUMLPanel from './PlantUMLPanel';
import ChatGPT from './ChatGPT';
import GeneralPanel from './GeneralPanel';

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

const Setting: React.FC = observer(() => {
  const styles = useStyles();
  const { t } = useTranslation('setting');
  const [tab, setTab] = useState('general');
  return (
    <div className={styles.root}>
      <TabList
        className={styles.tabList}
        selectedValue={tab}
        onTabSelect={(e, data) => setTab(data.value as string)}
        vertical
      >
        <Tab value="general">{t('general')}</Tab>
        <Tab value="editor">{t('editor')}</Tab>
        <Tab value="plantuml">PlantUML</Tab>
        {/* <Tab value="plugin">{t('plugin')}</Tab> */}
        <Tab value="chatgpt">{t('gptConfig')}</Tab>
      </TabList>
      <div className={styles.panel}>
        {tab === 'general' && <GeneralPanel />}
        {tab === 'editor' && <EditorPanel />}
        {tab === 'plantuml' && <PlantUMLPanel />}
        {/* {tab === 'plugin' && <PluginManager />} */}
        {tab === 'chatgpt' && <ChatGPT />}
      </div>
    </div>
  );
});

export default Setting;
