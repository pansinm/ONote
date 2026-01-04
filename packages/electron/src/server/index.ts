import type { Server } from 'http';
import setting from '../setting';

import app from './app';
import { getLogger } from 'shared/logger';

const logger = getLogger('Server');

let server: Server | undefined;

function getPort() {
  return setting.get('server.port') || '21221';
}

export function start(port: string) {
  server?.close(() => {
    logger.info('Server closed');
  });
  server = app.listen(port);
}

export function stop() {
  server?.close(() => {
    logger.info('Server stopped');
  });
}

start(getPort());
