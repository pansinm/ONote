import type { Server } from 'http';
import setting from '../setting';

import app from './app';

let server: Server | undefined;

function getPort() {
  return setting.get('server.port') || '21221';
}

export function start(port: string) {
  server?.close(() => {
    console.log('server closed');
  });
  server = app.listen(port);
}

export function stop() {
  server?.close(() => {
    console.log('server closed');
  });
}

start(getPort());
