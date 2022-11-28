import { BeforeAll, AfterAll, Before, After } from '@cucumber/cucumber';
import { _electron as electron } from 'playwright';
import * as fs from 'fs';
import type { ElectronApplication } from 'playwright';
import { getElectronApp } from './utils';

export type World = {
  electronApp: ElectronApplication;
};

BeforeAll(async function (this: World) {
  const app = ((global as any).electronApp = await electron.launch({
    args: ['.'],
  }));
  await app.evaluate(({ BrowserWindow }) => {
    const mainWindow = BrowserWindow.getAllWindows()[0];

    const getState = () => ({
      isVisible: mainWindow.isVisible(),
      isDevToolsOpened: mainWindow.webContents.isDevToolsOpened(),
      isCrashed: mainWindow.webContents.isCrashed(),
    });

    return new Promise((resolve) => {
      if (mainWindow.isVisible()) {
        resolve(getState());
      } else
        mainWindow.once('ready-to-show', () =>
          setTimeout(() => resolve(getState()), 0),
        );
    });
  });
});

Before(async function () {
  this.app = getElectronApp();
  this.page = await this.app.firstWindow();
});

After(function () {
  fs.writeFileSync('./fixtures/empty.md', '');
});

AfterAll(async function (this: World) {
  await (global as any).electronApp.close();
});
