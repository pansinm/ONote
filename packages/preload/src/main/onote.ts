import IPCClient from '../ipc/IPCClient';
import { exposeInMainWorld } from './exposeInMainWorld';
import { IPCNamespaces } from '../../../main/src/constants';
import type DataSourceHandler from '../../../main/src/ipc-server/handlers/DataSourceHandler';

export const onote = {
  dataSource: new IPCClient<DataSourceHandler>(IPCNamespaces.DataSource),
};

exposeInMainWorld('onote', onote);
