import { ipcRenderer } from 'electron';
import type { DevelopCall } from '../../../main/src/ipc/develop';

export const callDevelop: DevelopCall = (functionName, ...args) => {
  return ipcRenderer.invoke('develop', functionName, ...args);
};
