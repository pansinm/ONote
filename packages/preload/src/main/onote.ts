import IPCClient from '../ipc/IPCClient';
import { exposeInMainWorld } from './exposeInMainWorld';
import { IPCNamespaces } from '../../../main/src/constants';
import type DataSourceHandler from '../../../main/src/ipc-server/handlers/DataSourceHandler';
import type SettingHandler from '../../../main/src/ipc-server/handlers/SettingHandler';
import type PluginManagerHandler from '../../../main/src/ipc-server/handlers/PluginManagerHandler';
import type DevelopToolsHandler from '../../../main/src/ipc-server/handlers/DevelopToolsHandler';

export const onote = {
  dataSource: new IPCClient<DataSourceHandler>(IPCNamespaces.DataSource),
  setting: new IPCClient<SettingHandler>(IPCNamespaces.Setting),
  pluginManager: new IPCClient<PluginManagerHandler>(
    IPCNamespaces.PluginManager,
  ),
  developTools: new IPCClient<DevelopToolsHandler>(IPCNamespaces.DevelopTools),
};

exposeInMainWorld('onote', onote);
