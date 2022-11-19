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

type ToPromise<T extends (...args: any) => any> =
  ReturnType<T> extends Promise<any>
    ? T
    : (...args: Parameters<T>) => Promise<ReturnType<T>>;

type PromisifyFn<T> = {
  [key in keyof T]: T[key] extends (...args: any) => any
    ? ToPromise<T[key]>
    : never;
};

export type DataSourceCall = typeof callDataSource;

export type IPCDataSource = PromisifyFn<DataSource>;
