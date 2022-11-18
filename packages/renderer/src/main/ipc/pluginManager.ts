import type { manager } from '../../../../main/src/plugin';
import type { IPlugin } from '../../../../main/src/plugin/type';

type Manager = typeof manager;

type PromisifyFunc<T extends (...args: any) => any> =
  ReturnType<T> extends Promise<any>
    ? T
    : (...args: Parameters<T>) => Promise<ReturnType<T>>;

type PromisifyObject<T> = {
  [key in keyof T]: T[key] extends (...args: any) => any
    ? PromisifyFunc<T[key]>
    : never;
};

class PluginManager implements PromisifyObject<Manager> {
  install(urlOrPath: string): Promise<void> {
    return window.simmer.callPlugin('install', urlOrPath);
  }
  uninstall(name: string): Promise<void> {
    return window.simmer.callPlugin('uninstall', name);
  }
  load(plugin: IPlugin): Promise<void> {
    return window.simmer.callPlugin('load', plugin);
  }
  loadAll(): Promise<void> {
    return window.simmer.callPlugin('loadAll');
  }
  getPlugins() {
    return window.simmer.callPlugin('getPlugins');
  }
}

export default new PluginManager();
