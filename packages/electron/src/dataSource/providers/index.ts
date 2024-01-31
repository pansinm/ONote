import ProviderManager from './ProviderManager';
import GiteeDataSourceProvider from './gitee/GiteeDataSourceProvider';
import LocalDataSourceProvider from './local/LocalDataSourceProvider';
import SSHDataSourceProvider from './ssh/SSHDataSourceProvider';

export type { IDataSourceProvider } from './IDataSourceProvider';

export const dataSourceProviderManager = new ProviderManager();

dataSourceProviderManager.register(new LocalDataSourceProvider());

dataSourceProviderManager.register(new SSHDataSourceProvider());

dataSourceProviderManager.register(new GiteeDataSourceProvider());
