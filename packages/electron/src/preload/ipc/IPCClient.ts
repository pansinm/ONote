import { ipcRenderer } from 'electron';
import { getLogger } from 'shared/logger';

const logger = getLogger('IPCClient');

type PickMethods<T> = {
  // eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any
  [key in keyof T]: T[key] extends (...args: any) => any ? T[key] : never;
};

class IPCClient<T> {
  constructor(private namespace: string) {}

  invoke = async <TM extends PickMethods<T>, TP extends keyof TM>(
    method: TP,
    ...args: Parameters<TM[TP]>
  ): Promise<Awaited<ReturnType<TM[TP]>>> => {
    logger.debug('IPC invoke', { namespace: this.namespace, method });
    try {
      return await ipcRenderer.invoke(
        `${this.namespace}.${method as string}`,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(args as any),
      );
    } catch (err) {
      if (err instanceof Error) {
        const raw = err.message.replace(
          /^Error invoking remote method '[^']+': /,
          '',
        );
        throw Object.assign(new Error(), JSON.parse(raw));
      }
      throw err;
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addListener = (eventName: string, callback: (...args: any) => void) => {
    const channel = `${this.namespace}.${eventName}`;
    const listener = (event: Electron.IpcRendererEvent, ...args: any[]) =>
      callback(...args);
    ipcRenderer.on(channel, listener);
    return {
      dispose: () => ipcRenderer.off(channel, listener),
    };
  };
}

export default IPCClient;
