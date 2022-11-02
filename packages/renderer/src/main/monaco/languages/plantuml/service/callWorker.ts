import { uniqueId } from 'lodash';
import pumlWorker from './worker?worker';

let worker: any;

function getWorker() {
  if (!worker) {
    worker = new pumlWorker();
  }
  return worker;
}

export function call(type: string, ...params: any[]) {
  getWorker();
  const reqId = uniqueId('puml-');
  return new Promise((resolve, reject) => {
    const handle = (event: MessageEvent) => {
      const { id, res, error } = event.data;
      if (id === reqId) {
        error ? reject(error) : resolve(res);
        worker.removeEventListener('message', handle);
      }
    };
    worker.addEventListener('message', handle);
    worker.postMessage({ id: reqId, type, params });
  });
}
