import { ipcMain } from 'electron';
import localFileService from './localFileService';

ipcMain.handle(
  'fileservice',
  (event, command: keyof typeof localFileService, ...args) => {
    return (localFileService[command] as any)(...args);
  },
);
