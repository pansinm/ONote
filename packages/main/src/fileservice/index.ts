import { ipcMain } from 'electron';
import FileService from './FileService';

const fileService = new FileService();

ipcMain.handle(
  'fileservice',
  (event, command: keyof typeof fileService, ...args) => {
    return (fileService[command] as any)(...args);
  },
);

export default fileService;
