export interface IPlugin {
  name: string;
  author: string;
  version: string;
  title: string;
  description?: string;
  installDir: string;
  homepage?: string;
  downloadUrl: string;
  logo?: string;
  hasUpdate?: boolean;
  state?: 'installed' | 'uninstalled';
}
