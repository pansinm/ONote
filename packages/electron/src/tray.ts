import { Tray, app, nativeImage, Menu } from 'electron';
import { existsSync } from 'fs';
import { join } from 'path';
import { restoreOrCreateWindow } from './window';

let tray: Tray | null = null;

function getIconPaths() {
  return app.isPackaged
    ? [
        join(app.getAppPath(), 'buildResources', 'tray-icon.png'),
        join(app.getAppPath(), 'buildResources', 'tray-icon@2x.png'),
      ]
    : [
        join(process.cwd(), 'buildResources', 'tray-icon.png'),
        join(process.cwd(), 'buildResources', 'tray-icon@2x.png'),
        join(app.getAppPath(), 'buildResources', 'tray-icon.png'),
        join(app.getAppPath(), 'buildResources', 'tray-icon@2x.png'),
        join(app.getAppPath(), '../buildResources/tray-icon.png'),
        join(app.getAppPath(), '../buildResources/tray-icon@2x.png'),
        join(app.getAppPath(), '../../buildResources/tray-icon.png'),
        join(app.getAppPath(), '../../buildResources/tray-icon@2x.png'),
        join(app.getAppPath(), '../../../buildResources/tray-icon.png'),
        join(app.getAppPath(), '../../../buildResources/tray-icon@2x.png'),
      ];
}

function createTrayImage() {
  const iconPath = getIconPaths().find((candidate) => existsSync(candidate));
  const icon = iconPath ? nativeImage.createFromPath(iconPath) : nativeImage.createEmpty();

  if (process.platform === 'darwin' && !icon.isEmpty()) {
    icon.setTemplateImage(true);
  }

  return icon;
}

export function createTrayIcon() {
  if (!tray) {
    const icon = createTrayImage();
    tray = new Tray(icon);
    tray.setToolTip('ONote');

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
