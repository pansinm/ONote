import { ipcRenderer } from 'electron';
import type { PluginCall } from '../../../main/src/ipc/plugin';

export const callPlugin: PluginCall = (functionName, ...args) => {
  return ipcRenderer.invoke('plugin', functionName, ...args);
};
