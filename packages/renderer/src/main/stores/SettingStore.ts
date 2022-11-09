import { makeAutoObservable } from 'mobx';
import { settingAdapter } from '../ipc';

class SettingStore {
  settings: Record<string, unknown> = {};

  constructor() {
    settingAdapter.getAll().then((settings) => {
      this.settings = settings;
    });
    settingAdapter.on('changed', (data) => {
      this.replace(data.all);
    });
    makeAutoObservable(this);
  }

  replace(settings: Record<string, any>) {
    this.settings = settings;
  }

  update(key: string, value: any) {
    return settingAdapter.update(key, value);
  }
}

export default SettingStore;
