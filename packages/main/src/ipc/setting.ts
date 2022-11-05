import { ipcMain } from 'electron';
import setting from '../setting';

type Setting = typeof setting;
type CallableKey = keyof Setting;

const callSetting = async <T extends CallableKey>(
  functionName: T,
  ...args: Parameters<Setting[T]>
) => {
  return (setting[functionName] as any)(...args) as ReturnType<Setting[T]>;
};

export type SettingCall = typeof callSetting;

// 更新设置
ipcMain.handle('setting', (e, functionName, ...args) => {
  return callSetting(functionName, ...args);
});
