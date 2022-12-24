import { BrowserWindow, ipcMain, MessageChannelMain } from 'electron';
import { getPageUrl } from '../window';

ipcMain.handle('request-port', async (ev) => {
  const { port1, port2 } = new MessageChannelMain();
  const mainWindow = await BrowserWindow.getAllWindows().find(
    (w) => w.webContents.getURL() === getPageUrl('main'),
  );
  mainWindow?.webContents.postMessage('port', null, [port1]);
  ev.sender.postMessage('port', null, [port2]);
});

ipcMain.handle('create-tunnel-port', async (ev, payload, meta) => {
  const { port1, port2 } = new MessageChannelMain();
  const mainWindow = await BrowserWindow.getAllWindows().find(
    (w) => w.webContents.getURL() === getPageUrl('main'),
  );
  mainWindow?.webContents.postMessage(
    'channel-port',
    {
      channel: 'channel-port',
      payload,
      meta,
    },
    [port1],
  );
  ev.sender.postMessage(
    'channel-port',
    {
      channel: 'channel-port',
      payload,
      meta,
    },
    [port2],
  );
});
