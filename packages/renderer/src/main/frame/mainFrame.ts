import * as monaco from 'monaco-editor';
import type {
  Dispose,
  IEditorExtension,
  IFilePanel,
  MainFrame as IMainFrame,
} from '@sinm/onote-plugin/lib/mainFrame';
import { portsServer } from '../ipc';
import fileService from '../services/fileService';
import stores from '../stores';
import filePanelManager from './filePanelManager';
import monacoExtensionManager from './monacoExtensionManager';
import { reaction } from 'mobx';

class MainFrame implements IMainFrame {
  onTabOpened(callback: (uri: string) => void) {
    const disposer = reaction(
      () => stores.activationStore.activeFileUri,
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
  readFile(uri: string): Promise<Uint8Array> {
    return fileService.readFile(uri);
  }
  readText(uri: string): Promise<string> {
    return fileService.readText(uri);
  }
  writeFile(uri: string, content: Uint8Array): Promise<void> {
    return fileService.writeFile(uri, content as Buffer);
  }
  writeText(uri: string, content: string): Promise<void> {
    return fileService.writeText(uri, content);
  }
  listenPortEvent(
    eventName: string,
    listener: (port: MessagePort, payload: any) => void,
  ): Dispose {
    return portsServer.listenEvent(eventName, listener);
  }
  sendPortEvent(port: MessagePort, eventName: string, payload: any): void {
    return portsServer.sendEvent(port, eventName, payload);
  }
  handlePortRequest(
    method: string,
    handler: (payload: any) => Promise<any>,
  ): Dispose {
    return portsServer.handleRequest(method, handler);
  }
  getCurrentTabUrl(): string | undefined {
    return stores.activationStore.activeFileUri;
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
