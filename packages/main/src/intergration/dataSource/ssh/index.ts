import { manager } from '/@/dataSource';
import SSHDataSourceProvider from './SSHDataSourceProvider';

const sshDataSource = manager.register('ssh');

sshDataSource.setProvider(new SSHDataSourceProvider());
