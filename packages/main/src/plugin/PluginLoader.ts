import onote from '../onote';
import path from 'path';
import type { IPlugin } from './type';

class PluginLoader {
  pluginRoot: string;
  constructor(pluginRoot: string) {
    this.pluginRoot = pluginRoot;
  }
  load(pluginName: string) {
    const pluginDir = path.join(this.pluginRoot, pluginName);
    try {
      const { setup } = require(pluginDir);
      setup(onote);
      console.log(`plugin ${pluginName} load success`, pluginDir);
    } catch (err) {
      console.error(`plugin ${pluginName} load failed`, pluginDir, err);
      // ignore
    }
  }
}

export default PluginLoader;
