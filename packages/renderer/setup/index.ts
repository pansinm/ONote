// todo: move to setup
window.MessageChannel = require('worker_threads').MessageChannel;

const _postMessage = (window as any)._postMessage || window.postMessage;
if (!(window as any)._postMessage) {
  (window as any)._postMessage = _postMessage.bind(window);
}

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
  if (transfer) {
    e.ports = transfer;
    window.dispatchEvent(event);
  } else {
    (window as any)._postMessage(message, targetOrigin);
  }
}

window.postMessage = postMessage.bind(window);
