import { BeforeAll, AfterAll } from '@cucumber/cucumber';
import { _electron as electron } from 'playwright';
import type { ElectronApplication } from 'playwright';

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

AfterAll(async function (this: World) {
  await (global as any).electronApp.close();
});
