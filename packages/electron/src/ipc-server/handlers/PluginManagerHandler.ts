import IpcHandler from '../IpcHandler';
import { pluginManager } from '/@/plugin';
import type { IPlugin } from '/@/plugin/type';

class PluginManagerHandler extends IpcHandler {
  install(urlOrPath: string): Promise<void> {
    return pluginManager.install(urlOrPath);
  }
  uninstall(name: string): Promise<void> {
    return pluginManager.uninstall(name);
  }
  load(plugin: IPlugin): Promise<void> {
    return pluginManager.load(plugin);
  }
  loadAll(): Promise<void> {
    return pluginManager.loadAll();
  }
  getPlugins(): Record<string, IPlugin> {
    return pluginManager.getPlugins();
  }
}

export default PluginManagerHandler;
