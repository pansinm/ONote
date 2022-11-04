export interface IPlugin {
  name: string;
  pluginDir: string;
  state?: 'installed' | 'loaded' | 'unload' | 'uninstalled';
}
