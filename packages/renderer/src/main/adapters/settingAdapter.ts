import { EventEmitter } from 'events';

class SettingAdapter extends EventEmitter {
  constructor() {
    super();
    window.addEventListener('message', (ev) => {
      const { type, payload } = ev.data || {};
      if (type === 'setting.updated') {
        this.emit('changed', payload);
      }
    });
  }
  update(key: string, value: any) {
    return window.simmer.callSetting('update', key, value);
  }
  getAll() {
    return window.simmer.callSetting('getAll');
  }
}

export default new SettingAdapter();
