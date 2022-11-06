import type { IPCDataSource } from '../../../../main/src/ipc/dataSource';

export function getDataSourceAdapter(dataSourceId: string) {
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

export const currentDataSourceAdapter = getDataSourceAdapter('current');