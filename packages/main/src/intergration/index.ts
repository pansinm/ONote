import { manager } from '../dataSource';
import './dataSource/local';
import './dataSource/ssh';

manager.setCurrentDataSource('local');
