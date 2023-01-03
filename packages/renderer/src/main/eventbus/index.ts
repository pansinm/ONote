import { EventEmitter } from 'events';

const eventbus = new EventEmitter();

window.addEventListener('message', (ev) => {
  const { channel, payload, meta } = ev.data || {};
  if (channel && !['request', 'response'].includes(meta?.type)) {
    eventbus.emit(channel, payload, meta);
  }
});

export default eventbus;
