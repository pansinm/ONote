import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import PluginScanner from './PluginScanner';
import type { IPlugin } from './type';
import http from 'http';
import { fileURLToPath } from 'url';
import https from 'https';
import fsc from 'fs';
import tar from 'tar';
import onote from '../onote';
import { getMainFrame, getPreviewerFrames, injectJs } from '../window/frames';

const ONOTE_ROOT = path.join(os.homedir(), 'onote');
export const PLUGIN_ROOT = path.join(ONOTE_ROOT, 'plugins');

class PluginManager {
  private scanner = new PluginScanner(PLUGIN_ROOT);

  private plugins: Record<string, IPlugin> = {};

  private disposers: Record<string, () => void> = {};

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
      if (this.plugins[pkg.name]) {
        await this.uninstall(pkg.name);
      }
      const installDir = path.join(PLUGIN_ROOT, pkg.name);
      await this.recreateDir(installDir);
      if (os.platform() === 'win32') {
        await fs.cp(path.join(tmpDir), installDir, { recursive: true, force: true });
      } else {
        await fs.rename(path.join(tmpDir), installDir);
      }
      return {
        name: pkg.name,
        title: pkg.title || pkg.name,
        backendJs:
          pkg.backend && require.resolve(path.join(installDir, pkg.backend)),
        mainJs: pkg.main && require.resolve(path.join(installDir, pkg.main)),
        previewerJs:
          pkg.previewer &&
          require.resolve(path.join(installDir, pkg.previewer)),
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
    this.plugins[plugin.name] = {
      ...plugin,
      downloadUrl: urlOrPath,
      state: 'installed',
    };
    return this.load(this.plugins[plugin.name]);
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
    try {
      this.disposers[name]?.();
      delete this.disposers[name];
    } catch (err) {
      // ignore
    }
    // 移除require的模块
    Object.keys(require.cache).forEach(function (cachePath) {
      if (cachePath.startsWith(plugin.installDir)) {
        delete require.cache[cachePath];
      }
    });
    if (plugin) {
      await fs.rm(plugin.installDir, { recursive: true, force: true });
    }
    this.updateConfig((prev) => {
      delete prev?.plugins[name];
      return prev;
    });
    delete this.plugins[name];
  }

  async load(plugin: IPlugin) {
    if (plugin.backendJs) {
      try {
        const { setup } = require(plugin.backendJs);
        this.disposers[plugin.name] = setup(onote);
        console.log(`plugin ${plugin.name} load success`, plugin.installDir);
      } catch (err) {
        console.error(
          `plugin ${plugin.name} load failed`,
          plugin.installDir,
          err,
        );
      }
    }
    const mainFrame = getMainFrame();
    const previewerFrames = getPreviewerFrames();
    await mainFrame?.executeJavaScript(
      `window.__plugins = ${JSON.stringify(this.getPlugins())};`,
    ),
      await injectJs(mainFrame, plugin.mainJs);
    await Promise.all(
      previewerFrames.map((f) => injectJs(f, plugin.previewerJs)),
    );
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
