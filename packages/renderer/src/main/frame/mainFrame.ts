import * as monaco from 'monaco-editor';
import type {
  IEditorExtension,
  IFilePanel,
  MainFrame as IMainFrame,
} from '@sinm/onote-plugin/main';
import fileService from '../services/fileService';
import stores from '../stores';
import filePanelManager from './filePanelManager';
import monacoExtensionManager from '../monaco/monacoExtensionManager';
import { reaction } from 'mobx';
import type Tunnel from '/@/common/tunnel/Tunnel';
import tunnelPool from '../ipc/tunnelPool';

class MainFrame {
  onNewTunnel(callback: (tunnel: Tunnel) => void) {
    return tunnelPool.on('new', callback);
  }

  findTunnels(indicate: (tunnel: Tunnel) => boolean) {
    return tunnelPool.findAll(indicate);
  }

  getActiveTab() {
    return { uri: stores.activationStore.activeFileUri };
  }

  openTab(uri: string): void {
    stores.activationStore.activeFile(uri);
  }

  onTabActivated(callback: (tab: { uri: string }) => void) {
    const disposer = reaction(
      () => ({ uri: stores.activationStore.activeFileUri }),
      callback,
    );
    return disposer;
  }
  registerEditorExtension(extension: IEditorExtension): void {
    monacoExtensionManager.registerMonacoExtension(extension);
  }
  registerFilePanel(panel: IFilePanel): void {
    filePanelManager.registerFilePanel(panel);
  }
  readFile(uri: string): Promise<Buffer> {
    return fileService.readFile(uri);
  }
  readText(uri: string): Promise<string> {
    return fileService.readText(uri);
  }
  writeFile(uri: string, content: Buffer): Promise<void> {
    return fileService.writeFile(uri, content as Buffer);
  }
  writeText(uri: string, content: string): Promise<void> {
    return fileService.writeText(uri, content);
  }

  invokeIpc(channel: string, ...args: any[]) {
    return window.simmer.invokeIpc(channel, ...args);
  }

  getPluginRootUri(pluginName: string): string {
    const installDir = (window as any)?.__plugins?.[pluginName].installDir;
    if (installDir) {
      return monaco.Uri.file(installDir).toString();
    }
    return '';
  }
}

const mainFrame = new MainFrame();

(window as any).__frame = mainFrame;

export default mainFrame;
