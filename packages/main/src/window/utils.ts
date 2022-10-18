import { BrowserWindow } from 'electron';

export function findWindow(type: 'main' | 'previewer') {
  return BrowserWindow.getAllWindows().find(
    (w) => w.webContents.getURL().includes(type + '.html') && !w.isDestroyed(),
  );
}
