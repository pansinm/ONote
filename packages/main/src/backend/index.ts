import config from '../config';
import Backend from './Backend';
import createBackend from './createBackend';

const defaultBackend = createBackend(config.BACKEND, config.PROJECT_ID);
export default new Backend(defaultBackend);
