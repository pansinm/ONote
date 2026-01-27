import { BrowserWindow } from 'electron';

export function findWindow(type: 'main' | 'previewer') {
  return BrowserWindow.getAllWindows().find(
    (w) => w.webContents.getURL().includes(type + '.html') && !w.isDestroyed(),
  );
}

export const getPageUrl = (type: 'main' | 'previewer') => {
  if (process.env.NODE_ENV === 'development' && process.env.DEV_SERVER_URL) {
    const url = new URL(process.env.DEV_SERVER_URL);
    return `${url.protocol}//${url.host}/${type}.html`;
  }
  return new URL(
    `../renderer/dist/${type}.html`,
    'file://' + __dirname,
  ).toString();
};
