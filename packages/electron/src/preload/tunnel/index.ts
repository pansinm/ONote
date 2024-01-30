import { ipcRenderer } from 'electron';

ipcRenderer.on('tunnel-port', (e, message) => {
  // e.ports is a list of ports sent along with this message
  window.postMessage(message, '*', [e.ports[0]]);
});

window.addEventListener('message', (event) => {
  const { channel, payload, meta } = event.data;
  if (channel === 'create-tunnel-port') {
    ipcRenderer.invoke('create-tunnel-port', payload, meta);
  }
});

export {};
