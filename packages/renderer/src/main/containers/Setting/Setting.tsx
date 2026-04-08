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
    width: '140px',
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
        <Tab value="diagrams">{t('diagrams')}</Tab>
        {/* <Tab value="plugin">{t('plugin')}</Tab> */}
        <Tab value="ai-assistant">{t('aiAssistant')}</Tab>
        <Tab value="about">{t('about')}</Tab>
      </TabList>
      <div className={styles.panel}>
        {tab === 'general' && <GeneralPanel />}
        {tab === 'editor' && <EditorPanel />}
        {tab === 'diagrams' && <PlantUMLPanel />}
        {/* {tab === 'plugin' && <PluginManager />} */}
        {tab === 'ai-assistant' && <ChatGPT />}
        {tab === 'about' && <AboutPanel />}
      </div>
    </div>
  );
});

// ========== 关于面板 ==========
const APP_VERSION = '0.14.0';

const AboutPanel: React.FC = () => {
  const { t } = useTranslation('setting');

  return (
    <div style={{ padding: '20px', maxWidth: '400px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>ONote</h2>
      <p style={{ color: '#605e5c', fontSize: '13px', marginBottom: '16px', lineHeight: 1.5 }}>
        {t('onoteDesc')}
      </p>
      <div style={{ fontSize: '13px', color: '#8a8886', marginBottom: '8px' }}>
        {t('version')}: {APP_VERSION}
      </div>
    </div>
  );
};

export default Setting;
