import { webContents } from 'electron';
import { IPCNamespaces } from '../constants';
import { EventNames } from '../dataSource/constants';
import IPCServer from './IPCServer';
import DataSourceHandler from './handlers/DataSourceHandler';
import { delegateEvent } from './utils';
import { getMainFrame } from '../window';
import { dataSource } from '../dataSource';

/**
 * 处理渲染进程事件
 */
const ipcServer = new IPCServer();

function startDataSource() {
  ipcServer.register(IPCNamespaces.DataSource, DataSourceHandler);
  delegateEvent(
    dataSource,
    EventNames.FileContentChanged,
    IPCNamespaces.DataSource,
    () => webContents.fromFrame(getMainFrame()!)!,
  );
}

export function startIpcServer() {
  console.log('start ipc server');
  startDataSource();
}
