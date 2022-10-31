import { BrowserWindow, ipcMain } from 'electron';
import { restoreOrCreateWindow } from './factory';
import { findWindow } from './utils';

ipcMain.on('window', (event, command: string, ...args) => {
  switch (command) {
    case 'showPreviewerWindow':
      return restoreOrCreateWindow('previewer');
    case 'postMessageToPreviewer':
      return findWindow('previewer')?.webContents.postMessage(
        'message',
        args[0],
      );
    case 'postMessageToMain':
      return findWindow('main')?.webContents.postMessage('message', args[0]);
    default:
      break;
  }
});

export function sendToMain(channel: string, message: any) {
  return findWindow('main')?.webContents.postMessage(channel, message);
}
