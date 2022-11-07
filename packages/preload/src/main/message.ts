import { ipcRenderer } from 'electron';

ipcRenderer.on('port', (e) => {
  // e.ports is a list of ports sent along with this message
  window.postMessage(
    {
      type: 'port',
    },
    '*',
    [e.ports[0]],
  );
});

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
