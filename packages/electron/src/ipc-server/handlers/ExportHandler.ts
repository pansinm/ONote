import path from 'node:path';
import fs from 'fs/promises';
import { app, BrowserWindow, dialog } from 'electron';
import { join } from 'path';
import IpcHandler from '../IpcHandler';
import { uriToPath } from '/@/dataSource/providers/ssh/uri';
import { getPageUrl } from '../../window/utils';

class ExportHandler extends IpcHandler {
  async exportToPdf(uri: string, content: string): Promise<void> {
    const win = new BrowserWindow({
      show: false,
      webPreferences: {
        preload: join(
          app.getAppPath(),
          'packages/electron/dist/preload/previewer.cjs',
        ),
        webSecurity: false,
        contextIsolation: true,
        sandbox: false,
      },
    });

    await win.loadURL(getPageUrl('previewer'));

    win.webContents.postMessage('message', {
      type: 'event',
      method: 'OpenedModelChangedEvent',
      id: Date.now().toString(),
      payload: { uri, content, rootDirUri: '' },
    });

    await new Promise((r) => setTimeout(r, 1500));

    const pdfBuffer = await win.webContents.printToPDF({
      printBackground: true,
      pageSize: 'A4',
    });
    win.destroy();

    const filePath = uriToPath(uri);
    const name =
      path.basename(filePath, path.extname(filePath)) + '.pdf';
    const { filePath: savePath } = await dialog.showSaveDialog({
      defaultPath: name,
      filters: [{ name: 'PDF', extensions: ['pdf'] }],
    });
    if (savePath) {
      await fs.writeFile(savePath, pdfBuffer);
    }
  }
}

export default ExportHandler;
