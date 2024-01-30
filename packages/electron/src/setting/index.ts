import { app, BrowserWindow, ipcMain } from 'electron';
import EventEmitter from 'events';
import * as fsp from 'fs/promises';
import { decrypt, encrypt } from '../utils/security';
import { findWindow } from '../window/utils';
import { defaultSetting } from './defaultSetting';
import { EventNames } from '../constants';

const configFile = app.getPath('userData') + '/.onote-setting.json';

class Setting extends EventEmitter {
  private _setting: Record<string, any> = {};
  private configFile: string;
  constructor(configFile: string) {
    super();
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

  set(key: string, value: any) {
    this._setting[key] = value;
    this.emit(EventNames.SettingUpdated, key, value, this._setting);
    this.syncToFile();
  }

  get(key: string) {
    return this.getAll()[key] || defaultSetting[key];
  }

  getAll() {
    return Object.assign(
      {
        ...defaultSetting,
      },
      this._setting,
    );
  }
}

const setting = new Setting(configFile);

export default setting;
