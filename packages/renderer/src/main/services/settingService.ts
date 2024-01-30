import { EventEmitter } from 'events';

const setting = window.onote.setting;

class Setting extends EventEmitter {
  constructor() {
    super();
    setting.addListener('setting.updated', (key, value, all) => {
      this.emit('changed', {
        key,
        value,
        all,
      });
    });
  }
  update(key: string, value: any) {
    return setting.invoke('set', key, value);
  }
  getAll() {
    return setting.invoke('getAll');
  }
}

export default new Setting();
