import fs from 'fs/promises';
import type { IPlugin } from './type';
import path from 'path';

class PluginScanner {
  pluginsDir: string;
  constructor(pluginsDir: string) {
    this.pluginsDir = pluginsDir;
  }
  async scan(): Promise<Record<string, IPlugin>> {
    try {
      const pkg = await fs.readFile(
        path.resolve(this.pluginsDir, 'plugins.json'),
        'utf-8',
      );
      const { plugins: plugins } = JSON.parse(pkg);
      return plugins;
    } catch (err) {
      console.error('scan error', err);
      return {};
    }
  }
}

export default PluginScanner;
