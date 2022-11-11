import { developAdapter, portsServer } from './ipc';

function reload() {
  portsServer.closeAll();
  window.location.reload();
}

window.document.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'I':
      event.shiftKey && event.ctrlKey && developAdapter.openDevTools();
      break;
    case 'r':
      event.ctrlKey && reload();
      break;
    default:
      break;
  }
});
