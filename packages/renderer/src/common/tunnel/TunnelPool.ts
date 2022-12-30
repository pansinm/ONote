import EventEmitter from 'events';
import Tunnel from './Tunnel';

class TunnelPool {
  private emitter = new EventEmitter();
  private tunnels: Tunnel[] = [];

  on(name: string, handler: (...args: any[]) => void) {
    this.emitter.on(name, handler);
  }

  findAll(predicate: (tunnel: Tunnel) => boolean) {
    return this.tunnels.filter(predicate);
  }

  constructor() {
    window.addEventListener('message', (ev) => {
      const { channel, meta } = ev.data;
      if (channel === 'tunnel-port' && !meta.isSender) {
        const port = ev.ports[0];
        const tunnel = new Tunnel(meta.groupId, meta.peerId, port);
        this.tunnels.push(tunnel);
        this.emitter.emit('new', tunnel);
      }
    });
  }
}

export default TunnelPool;
