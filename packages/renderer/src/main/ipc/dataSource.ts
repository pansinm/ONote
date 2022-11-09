import type { IPCDataSource } from '../../../../main/src/ipc/dataSource';

export function getDataSource(dataSourceId: string) {
  return new Proxy(
    {},
    {
      get(target, p, receiver) {
        return window.simmer.callDataSource.bind(
          window.simmer,
          dataSourceId,
          p as any,
        );
      },
    },
  ) as IPCDataSource;
}

export const currentDataSource = getDataSource('current');
