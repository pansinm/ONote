import type { WebFrameMain } from 'electron';
import { app, BrowserWindow, nativeImage, shell, webFrameMain } from 'electron';
import { join } from 'path';
import { pluginManager as pluginManager } from '../plugin';
import { sendToMain } from './ipc';
import { findWindow, getPageUrl } from './utils';
import { injectJs } from './frames';
import { injectScript, isChatBox } from '../chatbox';

async function injectPluginJs(frame: WebFrameMain) {
  const plugins = Object.values(pluginManager.getPlugins());
  if (![getPageUrl('main'), getPageUrl('previewer')].includes(frame.url)) {
    return;
  }
  const isMainFrame = getPageUrl('main') === frame.url;
  for (const plugin of plugins) {
    try {
      await injectJs(frame, isMainFrame ? plugin.mainJs : plugin.previewerJs);
    } catch (err) {
      console.warn('load js failed', err);
    }
  }
}

async function createWindow(type: 'main' | 'previewer') {
  const iconPath = app.isPackaged
    ? join(process.cwd(), '../../buildResources/icon.png')
    : join(app.getAppPath(), 'buildResources/icon.png');
  const icon = nativeImage
    .createFromPath(iconPath)
    .resize({ width: 64, height: 64 });

  // app.dock.setIcon(icon);
  const browserWindow = new BrowserWindow({
    show: false, // Use 'ready-to-show' event to show window
    autoHideMenuBar: true,
    width: 1280,
    height: 768,
    icon: icon,

    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false, // Sandbox disabled because the demo of preload script depend on the Node.js api
      webviewTag: false, // The webview tag is not recommended. Consider alternatives like an iframe or Electron's BrowserView. @see https://www.electronjs.org/docs/latest/api/webview-tag#warning
      preload: join(
        app.getAppPath(),
        `packages/electron/dist/preload/${type}.cjs`,
      ),
      // webviewTag: false, // The webview tag is not recommended. Consider alternatives like iframe or Electron's BrowserView. https://www.electronjs.org/docs/latest/api/webview-tag#warning
      webSecurity: false, //!process.env.NODE_ENV === 'development',
    },
  });

  browserWindow.setIcon(icon);

  browserWindow.webContents.on('render-process-gone', (e, detail) => {
    console.log(e, detail);
  });

  browserWindow.webContents.on('destroyed', () => {
    console.log('destroy');
  });

  browserWindow.webContents.on('will-frame-navigate', (details) => {
    if (
      details.frame === details.initiator &&
      details.initiator?.name === 'previewer' &&
      details.frame.url !== details.initiator.url
    ) {
      details.preventDefault();
      shell.openExternal(details.url);
    }
    // details.preventDefault();
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
      if (!frame) {
        return;
      }
      frame
        ?.executeJavaScript(
          `window.__plugins = ${JSON.stringify(pluginManager.getPlugins())}`,
        )
        .then(() => {
          return injectPluginJs(frame);
        });
      if (isChatBox(frame)) {
        injectScript(frame);
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
    if (process.env.NODE_ENV === 'development') {
      browserWindow?.webContents.openDevTools();
    }
  });

  browserWindow.webContents.session.webRequest.onHeadersReceived(
    (details: any, callback: any) => {
      callback({
        responseHeaders: Object.fromEntries(
          Object.entries(details.responseHeaders).filter(
            (header) => !/x-frame-options/i.test(header[0]),
          ),
        ),
      });
    },
  );

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
    if (type === 'main') {
      window.on('close', (e) => {
        e.preventDefault();
        window?.hide();
      });
    }
  }

  if (window.isMinimized()) {
    window.restore();
  }
  window.show();
  window.focus();
}
