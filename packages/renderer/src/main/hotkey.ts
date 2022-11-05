import { developAdapter } from './adapters';

window.document.addEventListener('keydown', (event) => {
  console.log(event.key);
  switch (event.key) {
    case 'I':
      event.shiftKey && event.ctrlKey && developAdapter.openDevTools();
      break;
    case 'r':
      event.ctrlKey && window.location.reload();
      break;
    default:
      break;
  }
});
