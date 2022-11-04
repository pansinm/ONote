import { manager } from '/@/dataSource';
import LocalDataSourceProvider from './LocalDataSourceProvider';

const localDataSource = manager.register('local');

localDataSource.setProvider(new LocalDataSourceProvider());
