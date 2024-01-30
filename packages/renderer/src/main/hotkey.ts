import developToolsService from './services/developToolsService';

function reload() {
  window.location.reload();
}

window.document.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'I':
      event.shiftKey && event.ctrlKey && developToolsService.openDevTools();
      break;
    case 'r':
      event.ctrlKey && reload();
      break;
    default:
      break;
  }
});
