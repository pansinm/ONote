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

ipcRenderer.on('tunnel-port', (e, message) => {
  // e.ports is a list of ports sent along with this message
  window.postMessage(message, '*', [e.ports[0]]);
});
