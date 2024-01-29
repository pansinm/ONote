import ProviderManager from './ProviderManager';
import LocalDataSourceProvider from './local/LocalDataSourceProvider';
import SSHDataSourceProvider from './ssh/SSHDataSourceProvider';

export type { IDataSourceProvider } from './IDataSourceProvider';

export const dataSourceProviderManager = new ProviderManager();

dataSourceProviderManager.register(new LocalDataSourceProvider());

dataSourceProviderManager.register(new SSHDataSourceProvider());
