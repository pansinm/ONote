// todo: move to setup
window.MessageChannel = require('worker_threads').MessageChannel;

function postMessage(message, targetOrigin, transfer) {
  const event = window.document.createEvent('messageevent') as MessageEvent;
  event.initEvent('message');
  Object.defineProperty(event, 'data', {
    writable: true,
  });
  Object.defineProperty(event, 'ports', {
    writable: true,
  });
  const e = event as any;
  e._type = 'message';
  e.data = message;
  e.ports = transfer;

  this.dispatchEvent(event);
}

window.postMessage = postMessage.bind(window);
