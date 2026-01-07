import { Tray, app, nativeImage, Menu } from 'electron';
import { join } from 'path';
import { restoreOrCreateWindow } from './window';

let tray: Tray | null = null;

function getIconPath() {
  if (app.isPackaged) {
    return join(process.cwd(), '../../buildResources/tray-icon.png');
  }
  return join(app.getAppPath(), '../buildResources/tray-icon.png');
}

export function createTrayIcon() {
  if (!tray) {
    const iconPath = getIconPath();
    let icon = nativeImage.createFromPath(iconPath);

    if (process.platform === 'darwin') {
      icon = icon.resize({ width: 16, height: 16 });
      icon.setTemplateImage(true);
    } else {
      icon = icon.resize({ width: 16, height: 16 });
    }

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
