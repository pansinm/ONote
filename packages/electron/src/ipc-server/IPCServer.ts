import { ipcMain } from 'electron';
import type { IpcHandlerClass } from './IpcHandler';
import type IpcHandler from './IpcHandler';
import { getPrototypeFunctionKeys } from './utils';

class IPCServer {
  register<T extends typeof IpcHandler>(
    namespace: string,
    Handler: IpcHandlerClass<T>,
  ) {
    Handler.initialize(namespace);
    const methods = getPrototypeFunctionKeys(Handler);
    methods.forEach((method) => {
      ipcMain.handle(`${namespace}.${method}`, async (event, ...args) => {
        const instance = new Handler(event.sender, namespace);
        const fn = Reflect.get(instance as object, method) as (
          ...args: unknown[]
        ) => unknown;
        try {
          const res = await fn.call(instance, ...args);
          return res;
        } catch (err) {
          if (err instanceof Error) {
            throw JSON.stringify(
              Object.assign(
                { message: err?.message, name: err.name, stack: err.stack },
                err,
              ),
            );
          }
          throw JSON.stringify(err);
        }
      });
    });
  }
}

export default IPCServer;
