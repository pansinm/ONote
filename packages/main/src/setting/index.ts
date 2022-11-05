import { app, BrowserWindow, ipcMain } from 'electron';
import * as fsp from 'fs/promises';
import { decrypt, encrypt } from '../utils/security';

const configFile = app.getPath('userData') + '/.onote-setting.json';
class Setting {
  private _setting: Record<string, any> = {};
  private configFile: string;
  constructor(configFile: string) {
    this.configFile = configFile;
    this.loadFromFile();
  }
  private async loadFromFile() {
    try {
      const content = await fsp.readFile(this.configFile, 'utf-8');
      this._setting = JSON.parse(await decrypt(content));
    } catch (err) {
      // ignore
    }
  }
  private async syncToFile() {
    try {
      const content = await encrypt(JSON.stringify(this._setting));
      await fsp.writeFile(this.configFile, content);
    } catch (err) {
      // ignore
    }
  }
  update(key: string, value: any) {
    this._setting[key] = value;
    // 广播，同步到所有窗口
    BrowserWindow.getAllWindows().forEach((win) =>
      win.webContents.send('setting.updated', this._setting, key),
    );
    this.syncToFile();
  }
  getAll() {
    return this._setting;
  }
}

const setting = new Setting(configFile);

export default setting;
