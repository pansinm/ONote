import { app, dialog, ipcMain, Menu, protocol } from 'electron';
import './security-restrictions';
import './ipc';
import './intergration';
import { restoreOrCreateWindow } from './window';
import { manager } from './dataSource';
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
app.disableHardwareAcceleration();

Menu.setApplicationMenu(null);
/**
 * Shout down background process if all windows was closed
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
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
  .then(() => restoreOrCreateWindow('main'))
  .catch((e) => console.error('Failed create window:', e));

app.whenReady().then(() => {
  ipcMain.handle('open-directory', (event) => {
    return dialog.showOpenDialog({ properties: ['openDirectory'] });
  });
});

/**
 * Install Vue.js or some other devtools in development mode only
 */
if (import.meta.env.DEV) {
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
if (import.meta.env.PROD) {
  app
    .whenReady()
    .then(() => import('electron-updater'))
    .then(({ autoUpdater }) => autoUpdater.checkForUpdatesAndNotify())
    .catch((e) => console.error('Failed check updates:', e));
}

app.whenReady().then(() => {
  protocol.interceptFileProtocol('onote', async (request, callback) => {
    const url = request.url.split('?')[0];
    try {
      const localPath = await manager
        .getDataSource('current')
        .cache(url.replace(/^onote:/, 'file:'));
      callback({ path: decodeURI(localPath) });
    } catch (err) {
      callback({ statusCode: 500, data: JSON.stringify(err) });
    }
  });
});
