import { makeAutoObservable } from 'mobx';
import settingService from '../services/settingService';

class SettingStore {
  settings: Record<string, unknown> = {};

  constructor() {
    settingService.getAll().then((settings) => {
      this.settings = settings;
    });

    settingService.on('changed', (data) => {
      console.log(data);
      this.replace(data.all);
    });
    makeAutoObservable(this);
  }

  replace(settings: Record<string, any>) {
    this.settings = settings;
  }

  update(key: string, value: any) {
    return settingService.update(key, value);
  }
}

export default SettingStore;
