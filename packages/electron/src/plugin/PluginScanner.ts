import fs from 'fs/promises';
import path from 'path';
import { getLogger } from '/@/shared/logger';
import type { IPlugin } from './type';

const logger = getLogger('PluginScanner');

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
      logger.error('Failed to scan plugins', err);
      return {};
    }
  }
}

export default PluginScanner;
