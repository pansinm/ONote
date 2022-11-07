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

window.addEventListener('message', (event) => {
  const { type } = event.data;
  if (type === 'request-port') {
    ipcRenderer.invoke('request-port');
  }
});

export {};
