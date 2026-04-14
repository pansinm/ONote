import type { WebContents } from 'electron';
import type EventEmitter from 'events';

type IpcClass<T> = { new (sender: WebContents): T };

/**
 * 传入class的原型函数的key
 * @param Cls
 * @returns
 */
export function getPrototypeFunctionKeys<T extends IpcClass<T>>(
  Cls: InstanceType<T>,
) {
  const keys = Reflect.ownKeys(Cls.prototype).filter((key) => {
    if (key === 'constructor') {
      return false;
    }
    if (typeof key !== 'string') {
      return false;
    }
    if (typeof Cls.prototype[key] !== 'function') {
      return false;
    }
    return true;
  });
  // eslint-disable-next-line @typescript-eslint/ban-types
  return keys as string[];
}

export function isPackaged() {
  return __dirname.includes('app.asar');
}

export function delegateEvent(
  emitter: EventEmitter,
  eventName: string,
  ipcNamespace: string,
  webContentsFetcher: () => WebContents,
) {
  emitter.addListener(eventName, (...args) => {
    try {
      webContentsFetcher().send(`${ipcNamespace}.${eventName}`, ...args);
    } catch {
      // IPC 推送失败不应炸掉调用者（如 REST API / MCP 的写入操作）
      // 典型场景：窗口关闭中、GUI 未加载完成、headless 模式
    }
  });
}
