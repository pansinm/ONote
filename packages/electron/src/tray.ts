import { Tray, app, nativeImage, Menu } from 'electron';
import { join } from 'path';
import { restoreOrCreateWindow } from './window';

let tray: Tray | null = null;

const icon =
  process.env.NODE_ENV === 'development'
    ? 'buildResources/icon.png'
    : nativeImage.createFromPath(
        join(app.getAppPath(), 'buildResources/icon.png'),
      );

export function createTrayIcon() {
  if (!tray) {
    tray = new Tray(icon);
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '显示窗口',
        type: 'normal',
        click: () => {
          restoreOrCreateWindow('main');
        },
      },
      {
        label: '退出',
        type: 'normal',
        click: () => app.exit(),
      },
    ]);

    tray.setContextMenu(contextMenu);
  }
  return tray;
}
