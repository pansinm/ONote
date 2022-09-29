import { fileURLToPath } from 'url';
import { app, dialog, ipcMain, protocol } from 'electron';
import './security-restrictions';
import { restoreOrCreateWindow } from '/@/mainWindow';
import fileService from './fileservice';

/**
 * Prevent multiple instances
 */
// const isSingleInstance = app.requestSingleInstanceLock();
// if (!isSingleInstance) {
//   app.quit();
//   process.exit(0);
// }

app.on('second-instance', restoreOrCreateWindow);

/**
 * Disable Hardware Acceleration for more power-save
 */
app.disableHardwareAcceleration();

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
app.on('activate', restoreOrCreateWindow);

/**
 * Create app window when background process will be ready
 */
app
  .whenReady()
  .then(restoreOrCreateWindow)
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
  protocol.interceptFileProtocol('asset', async (request, callback) => {
    const url = request.url.split('?')[0];
    try {
      const localUri = await fileService.getLocalUri(
        url.replace(/^asset:/, 'file:'),
      );
      const filePath = fileURLToPath(localUri);
      callback({ path: filePath });
    } catch (err) {
      callback({ statusCode: 500, data: JSON.stringify(err) });
    }
  });
});
