import { ipcMain } from 'electron';
import backend from './backend';
import type { IBackend } from './backend/types';

ipcMain.handle('call-backend', (event, command, ...args) => {
  return (backend[command as keyof IBackend] as any)(...args);
});
