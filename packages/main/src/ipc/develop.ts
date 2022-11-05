import { ipcMain } from 'electron';

type ALL_FUN = {
  openDevTools(): void;
};

type CallableKey = keyof ALL_FUN;

export type DevelopCall = <T extends CallableKey>(
  functionName: T,
  ...args: Parameters<ALL_FUN[T]>
) => Promise<Awaited<ReturnType<ALL_FUN[T]>>>;

ipcMain.handle('develop', async (event, functionName: CallableKey, ...args) => {
  switch (functionName) {
    case 'openDevTools':
      return event.sender.openDevTools();
  }
});
