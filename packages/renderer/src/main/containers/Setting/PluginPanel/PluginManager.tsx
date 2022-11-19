import React, { useEffect, useState } from 'react';
import { Tab, TabList } from '@fluentui/react-components';
import PluginMarket from './PluginMarket';
import { useAsync, useAsyncFn } from 'react-use';
import type { IPlugin } from '/@/main/ipc/pluginManager';
import pluginManager from '/@/main/ipc/pluginManager';
import { decodeBase64 } from '/@/common/utils/crypto';
import PluginInstalled from './PluginInstalled';
import { compare } from 'semver';

async function getDefaultRepo(): Promise<Record<string, IPlugin>> {
  const url = await fetch(
    'https://api.github.com/repos/pansinm/onote-plugins/git/trees/master',
  )
    .then((res) => res.json())
    .then((data) => data.tree)
    .then((tree) => tree.find((item: any) => item.path === 'repo.json'))
    .then((item) => item.url);
  if (url) {
    return fetch(url)
      .then((res) => res.json())
      .then((data) => data.content)
      .then(decodeBase64)
      .then((content) => JSON.parse(content))
      .then((repo) => repo.plugins);
  }
  throw new Error('Repo not exist');
}

export default function PluginManager() {
  const [tab, setTab] = useState('market');
  const [pluginState, refetch] = useAsyncFn(
    () => pluginManager.getPlugins(),
    [],
  );

  const marketState = useAsync(() => getDefaultRepo(), []);
  useEffect(() => {
    refetch();
  }, []);

  const marketPlugins = Object.values(marketState.value || {}).map((plugin) => {
    const localPlugin = pluginState.value?.[plugin.name];
    if (!localPlugin) {
      return plugin;
    }
    plugin.state = localPlugin.state;
    plugin.hasUpdate = compare(plugin.version, localPlugin.version) > 0;
    localPlugin.hasUpdate = plugin.hasUpdate;
    return plugin;
  });

  const localPlugins = Object.values(pluginState.value || {});
  return (
    <div>
      <TabList
        selectedValue={tab}
        onTabSelect={(e, data) => setTab(data.value as string)}
      >
        <Tab value="market">插件市场</Tab>
        <Tab value="installed">已安装</Tab>
        {/* <Tab value="setting">设置</Tab> */}
      </TabList>
      {tab === 'market' && (
        <PluginMarket plugins={marketPlugins} onInstalled={refetch} />
      )}
      {tab === 'installed' && (
        <PluginInstalled plugins={localPlugins} onInstalled={refetch} />
      )}
    </div>
  );
}
