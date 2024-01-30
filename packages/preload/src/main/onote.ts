import IPCClient from '../ipc/IPCClient';
import { exposeInMainWorld } from './exposeInMainWorld';
import { IPCNamespaces } from '../../../main/src/constants';
import type DataSourceHandler from '../../../main/src/ipc-server/handlers/DataSourceHandler';
import type SettingHandler from '../../../main/src/ipc-server/handlers/SettingHandler';

export const onote = {
  dataSource: new IPCClient<DataSourceHandler>(IPCNamespaces.DataSource),
  setting: new IPCClient<SettingHandler>(IPCNamespaces.Setting),
};

exposeInMainWorld('onote', onote);
