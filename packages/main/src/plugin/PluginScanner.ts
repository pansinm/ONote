import fs from 'fs/promises';
import type { IPlugin } from './type';
import path from 'path';

class PluginScanner {
  pluginsDir: string;
  constructor(pluginsDir: string) {
    this.pluginsDir = pluginsDir;
  }
  async scan(): Promise<IPlugin[]> {
    try {
      const pkg = await fs.readFile(
        path.resolve(this.pluginsDir, 'package.json'),
        'utf-8',
      );
      const { dependencies } = JSON.parse(pkg);
      return Object.keys(dependencies).map((key) => ({
        name: key,
        version: dependencies[key],
        pluginDir: path.resolve(this.pluginsDir, 'node_modules', key),
      }));
    } catch (err) {
      return [];
    }
  }
}

export default PluginScanner;
