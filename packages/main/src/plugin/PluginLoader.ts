import onote from '../onote';
import type { IPlugin } from './type';

class PluginLoader {
  load(plugin: IPlugin) {
    try {
      const { setup } = require(plugin.pluginDir);
      setup(onote);
      console.log(`plugin ${plugin.name} load success`, plugin.pluginDir);
    } catch (err) {
      console.error(`plugin ${plugin.name} load failed`, plugin.pluginDir);
      // ignore
    }
  }
}

export default PluginLoader;
