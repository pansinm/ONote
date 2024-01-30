import IpcHandler from '../IpcHandler';
import setting from '../../setting';

class SettingHandler extends IpcHandler {
  set(key: string, value: any) {
    return setting.set(key, value);
  }

  get(key: string) {
    return setting.get(key);
  }
  getAll() {
    return setting.getAll();
  }
}

export default SettingHandler;
