import { makeAutoObservable } from 'mobx';
import settingService from '../services/settingService';
import { getLogger } from '/@/shared/logger';

const logger = getLogger('SettingStore');

class SettingStore {
  settings: Record<string, unknown> = {};

  constructor() {
    settingService.getAll().then((settings: Record<string, unknown>) => {
      this.settings = settings;
      logger.info('Settings loaded', { count: Object.keys(settings).length });
    });

    settingService.on('changed', (data) => {
      logger.debug('Settings changed', data);
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
