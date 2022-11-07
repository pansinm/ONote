import { app, BrowserWindow, nativeImage, shell, webFrameMain } from 'electron';
import { join } from 'path';
import { URL } from 'url';
import frames from '../frames';
import { sendToMain } from './ipc';
import { findWindow } from './utils';

export const getPageUrl = (type: 'main' | 'previewer') => {
  return import.meta.env.DEV &&
    import.meta.env.VITE_DEV_SERVER_URL !== undefined
    ? import.meta.env.VITE_DEV_SERVER_URL + `${type}.html`
    : new URL(
        `../renderer/dist/${type}.html`,
        'file://' + __dirname,
      ).toString();
};

async function createWindow(type: 'main' | 'previewer') {
  const browserWindow = new BrowserWindow({
    show: false, // Use 'ready-to-show' event to show window
    autoHideMenuBar: true,
    icon: import.meta.env.DEV
      ? 'buildResources/icon.png'
      : nativeImage.createFromPath(
          join(app.getAppPath(), 'buildResources/icon.png'),
        ),
    webPreferences: {
      nativeWindowOpen: true,
      webviewTag: false, // The webview tag is not recommended. Consider alternatives like iframe or Electron's BrowserView. https://www.electronjs.org/docs/latest/api/webview-tag#warning
      preload: join(__dirname, `../../preload/dist/${type}.cjs`),
      webSecurity: true,
    },
  });

  browserWindow.webContents.on(
    'did-frame-finish-load',
    (
      event,
      // url,
      // httpResponseCode,
      // httpStatusText,
      isMainFrame,
      frameProcessId,
      frameRoutingId,
    ) => {
      const frame = webFrameMain.fromId(frameProcessId, frameRoutingId);
      if (frame?.url) {
        frames.listeners.forEach((callback) => callback(frame));
      }
    },
  );
  /**
   * If you install `show: true` then it can cause issues when trying to close the window.
   * Use `show: false` and listener events `ready-to-show` to fix these issues.
   *
   * @see https://github.com/electron/electron/issues/25012
   */
  browserWindow.on('ready-to-show', () => {
    browserWindow?.show();
    if (import.meta.env.DEV) {
      browserWindow?.webContents.openDevTools();
    }
  });

  /**
   * URL for main window.
   * Vite dev server for development.
   * `file://../renderer/index.html` for production and test
   */
  const pageUrl = getPageUrl(type);

  await browserWindow.loadURL(pageUrl);
  browserWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^onote:/.test(url)) {
      sendToMain('open-file', { url });
      // Prevent creating new window in application
      return { action: 'deny' };
    }

    shell.openExternal(url);
    return { action: 'deny' };
  });
  return browserWindow;
}

/**
 * Restore existing BrowserWindow or Create new BrowserWindow
 */
export async function restoreOrCreateWindow(type: 'main' | 'previewer') {
  let window = findWindow(type);
  if (window === undefined) {
    window = await createWindow(type);
  }

  if (window.isMinimized()) {
    window.restore();
  }

  window.focus();
}
