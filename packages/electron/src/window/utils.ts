import { BrowserWindow } from 'electron';

export function findWindow(type: 'main' | 'previewer') {
  return BrowserWindow.getAllWindows().find(
    (w) => w.webContents.getURL().includes(type + '.html') && !w.isDestroyed(),
  );
}

export const getPageUrl = (type: 'main' | 'previewer') => {
  return process.env.NODE_ENV === 'development'
    ? `http://localhost:8080/${type}.html`
    : new URL(
        `../renderer/dist/${type}.html`,
        'file://' + __dirname,
      ).toString();
};
