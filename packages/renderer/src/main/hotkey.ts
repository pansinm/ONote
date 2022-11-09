import { developAdapter } from './ipc';
import portsManager from './ipc/portsServer';

function reload() {
  portsManager.closeAll();
  window.location.reload();
}

window.document.addEventListener('keydown', (event) => {
  console.log(event.key);
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
