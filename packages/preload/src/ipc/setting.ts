import { ipcRenderer } from 'electron';
import type { SettingCall } from '../../../main/src/ipc/setting';

export const callSetting: SettingCall = (functionName, ...args) => {
  return ipcRenderer.invoke('setting', functionName, ...args);
};
