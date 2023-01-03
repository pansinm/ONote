import { ipcRenderer } from 'electron';

// 转发到window
ipcRenderer.on('message', (e, message) => {
  window.postMessage(message);
});

ipcRenderer.on('open-file', (e, message) => {
  window.postMessage({
    type: 'open-file',
    ...message,
  });
});
