import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import PluginLoader from './PluginLoader';
import PluginScanner from './PluginScanner';
import type { IPlugin } from './type';
import http from 'http';
import { fileURLToPath } from 'url';
import https from 'https';
import fsc from 'fs';
import tar from 'tar';

const ONOTE_ROOT = path.join(os.homedir(), 'onote');
export const PLUGIN_ROOT = path.join(ONOTE_ROOT, 'plugins');

class PluginManager {
  private scanner = new PluginScanner(PLUGIN_ROOT);
  private loader = new PluginLoader(PLUGIN_ROOT);

  private plugins: Record<string, IPlugin> = {};

  constructor() {
    fs.mkdir(PLUGIN_ROOT, { recursive: true }).catch((err) => {
      // ignore
    });
  }
  private download(url: string): Promise<string> {
    const filePath = path.join(os.tmpdir(), Date.now() + '.tgz');
    const client = /^https:/.test(url) ? https : http;
    return new Promise((resolve, reject) => {
      try {
        const file = fsc.createWriteStream(filePath);
        let retryTimes = 0;
        const _download = (uri: string) => {
          client.get(uri, (res) => {
            if (
              [301, 302].includes(res.statusCode as number) &&
              res.headers.location &&
              retryTimes < 3
            ) {
              retryTimes++;
              _download(res.headers.location);
              return;
            }
            res
              .pipe(file)
              .on('error', reject)
              .on('finish', () => resolve(filePath));
          });
        };
        _download(url);
      } catch (err) {
        reject(err);
      }
    });
  }

  private async wget(urlOrPath: string) {
    let filePath = urlOrPath;
    if (/^https?:/.test(urlOrPath)) {
      filePath = await this.download(urlOrPath);
    }
    if (/^file:/.test(urlOrPath)) {
      filePath = fileURLToPath(urlOrPath);
    }
    return filePath;
  }

  private async recreateDir(dir: string) {
    await fs.rm(dir, { recursive: true }).catch((err) => 0);
    await fs.mkdir(dir, { recursive: true }).catch(() => 0);
  }

  private async extract(
    tgzPath: string,
  ): Promise<Omit<IPlugin, 'downloadUrl'>> {
    const tmpDir = path.join(
      ONOTE_ROOT,
      'pkg-' + Math.random().toString(36).slice(2),
    );
    try {
      await this.recreateDir(tmpDir);
      await tar.extract({
        file: tgzPath,
        cwd: tmpDir,
        strip: 1,
      });
      const pkg = JSON.parse(
        await fs.readFile(path.join(tmpDir, 'package.json'), 'utf-8'),
      );
      const installDir = path.join(PLUGIN_ROOT, pkg.name);
      await this.recreateDir(installDir);
      await fs.rename(path.join(tmpDir), installDir);
      return {
        name: pkg.name,
        title: pkg.title || pkg.name,
        description: pkg.description || pkg.name || '-',
        author: pkg.author || '-',
        version: pkg.version,
        installDir: installDir,
        homepage: pkg.homepage || pkg.repository,
      };
    } finally {
      fs.rm(tmpDir, { recursive: true }).catch(() => 0);
    }
  }

  async install(urlOrPath: string) {
    const tgzPath = await this.wget(urlOrPath);
    const plugin = await this.extract(tgzPath);
    this.updateConfig((prev) => {
      prev.plugins = Object.assign({}, prev.plugins, {
        [plugin.name]: {
          ...plugin,
          downloadUrl: urlOrPath,
        },
      });
      return prev;
    });
    return this.load({ ...plugin, downloadUrl: urlOrPath });
  }

  private updateConfig(callback: (prev: any) => any) {
    const configFile = path.join(PLUGIN_ROOT, 'plugins.json');
    let pluginConfig: any = {};
    try {
      pluginConfig = JSON.parse(fsc.readFileSync(configFile, 'utf-8'));
    } catch (err) {
      // ignore
    }
    callback(pluginConfig);
    fsc.writeFileSync(configFile, JSON.stringify(pluginConfig, null, 2));
  }

  async uninstall(name: string) {
    const plugin = this.plugins[name];
    if (plugin) {
      await fs.rmdir(plugin.installDir, { maxRetries: 3 });
    }
    this.updateConfig((prev) => {
      delete prev?.plugins[name];
      return prev;
    });
  }

  load(plugin: IPlugin) {
    return this.loader.load(plugin);
  }

  async loadAll() {
    const plugins = await this.scanner.scan();
    Object.keys(plugins).forEach((key) => {
      plugins[key].state = 'installed';
    });
    this.plugins = plugins;
    Object.values(plugins).forEach((plugin) => this.load(plugin));
  }

  getPlugins() {
    return this.plugins;
  }
}

export default PluginManager;
