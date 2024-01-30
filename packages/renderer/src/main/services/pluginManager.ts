const pluginManager = window.onote.pluginManager;
import type { IPlugin } from '../../../../main/src/plugin/type';

export { IPlugin };

class PluginManagerService {
  install(urlOrPath: string): Promise<void> {
    return pluginManager.invoke('install', urlOrPath);
  }
  uninstall(name: string): Promise<void> {
    return pluginManager.invoke('uninstall', name);
  }
  load(plugin: IPlugin): Promise<void> {
    return pluginManager.invoke('load', plugin);
  }
  loadAll(): Promise<void> {
    return pluginManager.invoke('loadAll');
  }
  getPlugins() {
    return pluginManager.invoke('getPlugins');
  }
}

export default new PluginManagerService();
