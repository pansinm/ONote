import { BrowserWindow, ipcMain, MessageChannelMain } from 'electron';
import { getPageUrl } from '../window';

ipcMain.handle('create-tunnel-port', async (ev, payload, meta) => {
  const { port1, port2 } = new MessageChannelMain();
  const mainWindow = await BrowserWindow.getAllWindows().find(
    (w) => w.webContents.getURL() === getPageUrl('main'),
  );
  mainWindow?.webContents.postMessage(
    'tunnel-port',
    {
      channel: 'tunnel-port',
      payload,
      meta: { ...meta, isSender: false },
    },
    [port1],
  );
  ev.sender.postMessage(
    'tunnel-port',
    {
      channel: 'tunnel-port',
      payload,
      meta: { ...meta, isSender: true },
    },
    [port2],
  );
});
