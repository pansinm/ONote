import { ipcRenderer } from 'electron';

// 转发到window
ipcRenderer.on('message', (e, message) => {
  window.postMessage(message);
});

// 转发给 main
window.addEventListener('message', (e) => {
  const { source, target } = e.data || {};
  if (source === 'previewer' && target === 'main') {
    ipcRenderer.send('window', 'postMessageToMain', e.data || {});
  }
});
