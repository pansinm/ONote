import { ipcMain } from 'electron';
import type { PluginManager } from '../plugin';
import { manager } from '../plugin';

type CallableKey = keyof PluginManager;

const callPlugin = async <T extends CallableKey>(
  functionName: T,
  ...args: Parameters<PluginManager[T]>
) => {
  return (manager[functionName] as any)(...args) as ReturnType<
    PluginManager[T]
  >;
};

export type PluginCall = typeof callPlugin;

ipcMain.handle('plugin', async (event, functionName, ...args) => {
  return callPlugin(functionName, ...args);
});
