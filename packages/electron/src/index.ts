import {
  app,
  crashReporter,
  dialog,
  ipcMain,
  Menu,
  nativeImage,
  net,
  protocol,
} from 'electron';
import * as os from 'os';
import path from 'path';
import './security-restrictions';
import { restoreOrCreateWindow } from './window';
import { pluginManager as pluginManager } from './plugin';
import './tunnel';
import { pathToFileURL } from 'url';

crashReporter.start({ uploadToServer: false });

import './server';
import { startIpcServer } from './ipc-server';
import { dataSource } from './dataSource';
import { createTrayIcon } from './tray';

/**
 * Prevent multiple instances
 */
// const isSingleInstance = app.requestSingleInstanceLock();
// if (!isSingleInstance) {
//   app.quit();
//   process.exit(0);
// }

// app.on('second-instance', restoreOrCreateWindow);

/**
 * Disable Hardware Acceleration for more power-save
 */
// app.disableHardwareAcceleration();

if (process.platform !== 'darwin') {
  // const template = [
  //   {
  //     label: app.getName(),
  //     submenu: [
  //       { role: 'about' },
  //       { type: 'separator' },
  //       { role: 'hide' },
  //       { role: 'hideOthers' },
  //       { role: 'unhide' },
  //       { type: 'separator' },
  //       { role: 'quit' },
  //     ],
  //   },
  //   {
  //     label: 'Edit',
  //     submenu: [
  //       { role: 'undo' },
  //       { role: 'redo' },
  //       { type: 'separator' },
  //       { role: 'cut' },
  //       { role: 'copy' },
  //       { role: 'paste' },
  //       { role: 'delete' },
  //       { role: 'selectAll' },
  //     ],
  //   },
  //   {
  //     role: 'window',
  //     submenu: [
  //       { role: 'close' },
  //       { role: 'minimize' },
  //       { role: 'zoom' },
  //       { type: 'separator' },
  //       { role: 'front' },
  //     ],
  //   },
  // ] satisfies Electron.MenuItemConstructorOptions[];

  // const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(null);
}

app.on('will-quit', () => {
  // TODO: clear all caches
  app.exit();
});
/**
 * Shout down background process if all windows was closed
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // app.quit();
  }
});

/**
 * @see https://www.electronjs.org/docs/v14-x-y/api/app#event-activate-macos Event: 'activate'
 */
app.on('activate', () => restoreOrCreateWindow('main'));

/**
 * Create app window when background process will be ready
 */
app
  .whenReady()
  .then(() => startIpcServer())
  .then(() => restoreOrCreateWindow('main'))
  .then(() => pluginManager.loadAll())
  .catch((e) => console.error('Failed create window:', e));

app.whenReady().then(() => {
  const tray = createTrayIcon();
  tray.on('click', () => {
    restoreOrCreateWindow('main');
  });
});

if (process.platform === 'win32') {
  app.whenReady().then(() => {
    app.setUserTasks([]);
  });
}

app.whenReady().then(() => {
  ipcMain.handle('open-directory', (event) => {
    return dialog.showOpenDialog({ properties: ['openDirectory'] });
  });
});

/**
 * Install Vue.js or some other devtools in development mode only
 */
if (process.env.NODE_ENV === 'development') {
  app
    .whenReady()
    .then(() => import('electron-devtools-installer'))
    .then(({ default: installExtension, REACT_DEVELOPER_TOOLS }) =>
      installExtension(REACT_DEVELOPER_TOOLS, {
        loadExtensionOptions: {
          allowFileAccess: true,
        },
      }),
    )
    .catch((e) => console.error('Failed install extension:', e));
}

/**
 * Check new app version in production mode only
 */
if (process.env.NODE_ENV === 'production') {
  app
    .whenReady()
    .then(() => import('electron-updater'))
    .then(({ autoUpdater }) => autoUpdater.checkForUpdatesAndNotify())
    .catch((e) => console.error('Failed check updates:', e));
}

// app.on('renderer-process-crashed', (event, webContents, kill) => {
//   console.warn('app:renderer-process-crashed', event, webContents, kill);
// });

app.whenReady().then(() => {
  protocol.handle('onote', async (request) => {
    const requestUrl = request.url.split('?')[0];
    try {
      const localPath = await dataSource.cache(
        requestUrl.replace(/^onote:/, 'file:'),
      );
      return net.fetch(pathToFileURL(localPath).toString());
    } catch (err) {
      console.log('error:', err);
      return new Response('bad', {
        status: 404,
        headers: { 'content-type': 'text/html' },
      });
    }
  });
});
