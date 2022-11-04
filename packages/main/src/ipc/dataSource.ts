import { ipcMain } from 'electron';
import { manager } from '../dataSource';
import type DataSource from '../dataSource/DataSource';

type CallAbleKey = Exclude<keyof DataSource, 'id'>;

function callDataSource<T extends CallAbleKey>(
  dataSourceId: string,
  functionName: T,
  ...args: Parameters<DataSource[T]>
): Promise<Awaited<ReturnType<DataSource[T]>>> {
  return (manager.getDataSource(dataSourceId)[functionName] as any)(...args);
}

ipcMain.handle(
  'datasource',
  async (event, dataSourceId, functionName, ...args) => {
    return callDataSource(dataSourceId, functionName, ...args);
  },
);

export type DataSourceCall = typeof callDataSource;
