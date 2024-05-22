import IPCClient from '../ipc/IPCClient';
import { exposeInMainWorld } from './exposeInMainWorld';
import { IPCNamespaces } from '../../constants';
import type DataSourceHandler from '../../ipc-server/handlers/DataSourceHandler';
import type SettingHandler from '../../ipc-server/handlers/SettingHandler';
import type PluginManagerHandler from '../../ipc-server/handlers/PluginManagerHandler';
import type DevelopToolsHandler from '../../ipc-server/handlers/DevelopToolsHandler';
import type CronHandler from '../../ipc-server/handlers/CronHandler';

export const onote = {
  dataSource: new IPCClient<DataSourceHandler>(IPCNamespaces.DataSource),
  setting: new IPCClient<SettingHandler>(IPCNamespaces.Setting),
  pluginManager: new IPCClient<PluginManagerHandler>(
    IPCNamespaces.PluginManager,
  ),
  cron: new IPCClient<CronHandler>(IPCNamespaces.Cron),
  developTools: new IPCClient<DevelopToolsHandler>(IPCNamespaces.DevelopTools),
};

exposeInMainWorld('onote', onote);
