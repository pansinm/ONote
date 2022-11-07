import React, { useState } from 'react';
import { Tab, TabList } from '@fluentui/react-components';

export default function PluginManager() {
  const [tab, setTab] = useState('store');
  return (
    <div>
      <TabList
        selectedValue={tab}
        onTabSelect={(e, data) => setTab(data.value as string)}
      >
        <Tab value="store">插件市场</Tab>
        <Tab value="installed">已安装</Tab>
        <Tab value="setting">设置</Tab>
      </TabList>
      <p>To Be Continue~</p>
    </div>
  );
}
