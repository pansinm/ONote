import onote from '../onote';
import type { IPlugin } from './type';

class PluginLoader {
  pluginRoot: string;
  constructor(pluginRoot: string) {
    this.pluginRoot = pluginRoot;
  }
  load(plugin: IPlugin) {
    try {
      const { setup } = require(plugin.installDir);
      setup(onote);
      console.log(`plugin ${plugin.name} load success`, plugin.installDir);
    } catch (err) {
      console.error(
        `plugin ${plugin.name} load failed`,
        plugin.installDir,
        err,
      );
      // ignore
    }
  }
}

export default PluginLoader;
