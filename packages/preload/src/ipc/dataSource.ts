import { ipcRenderer } from 'electron';
import type { DataSourceCall } from '../../../main/src/ipc/dataSource';

export const callDataSource: DataSourceCall = (
  dataSourceId,
  functionName,
  ...args
) => {
  return ipcRenderer.invoke('datasource', dataSourceId, functionName, ...args);
};
