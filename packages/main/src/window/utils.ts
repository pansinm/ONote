import { BrowserWindow } from 'electron';

export function findWindow(type: 'main' | 'previewer') {
  return BrowserWindow.getAllWindows().find(
    (w) => w.webContents.getURL().includes(type + '.html') && !w.isDestroyed(),
  );
}

export const getPageUrl = (type: 'main' | 'previewer') => {
  return import.meta.env.DEV &&
    import.meta.env.VITE_DEV_SERVER_URL !== undefined
    ? import.meta.env.VITE_DEV_SERVER_URL + `${type}.html`
    : new URL(
        `../renderer/dist/${type}.html`,
        'file://' + __dirname,
      ).toString();
};
