export interface IPlugin {
  name: string;
  mainJs?: string;
  previewerJs?: string;
  backendJs?: string;
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
