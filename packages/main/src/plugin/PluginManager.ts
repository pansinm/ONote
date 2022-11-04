import fs from 'fs/promises';
import path from 'path';
import PluginLoader from './PluginLoader';
import PluginScanner from './PluginScanner';
import type { IPlugin } from './type';

const PLUGIN_ROOT = path.resolve('~/onote/plugins');

class PluginManager {
  scanner = new PluginScanner(PLUGIN_ROOT);
  loader = new PluginLoader();

  plugins: Record<string, IPlugin> = {};

  async install(urlOrPath: string) {
    await fs.mkdir(path.resolve(), { recursive: true }).catch((err) => {
      // ignore
    });
  }

  uninstall(name: string) {
    const plugin = this.plugins[name];
    if (plugin) {
      return fs.rmdir(plugin.pluginDir, { maxRetries: 3 });
    }
  }

  load(plugin: IPlugin) {
    this.loader.load(plugin);
  }

  loadAll() {
    return this.scanner
      .scan()
      .then((plugins) => plugins.forEach((plugin) => this.loader.load(plugin)));
  }
}

export default new PluginManager();
