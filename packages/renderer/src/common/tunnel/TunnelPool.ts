import EventEmitter from 'events';
import Tunnel from './Tunnel';

class TunnelPool {
  private emitter = new EventEmitter();
  private tunnels: Tunnel[] = [];

  on(name: string, handler: (...args: any[]) => void) {
    this.emitter.on(name, handler);
    return {
      dispose: () => this.emitter.off(name, handler),
    };
  }

  findAll(predicate: (tunnel: Tunnel) => boolean) {
    return this.tunnels.filter((tunnel) => !tunnel.disposed).filter(predicate);
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
      if (channel === 'create-tunnel-port') {
        const { port1, port2 } = new MessageChannel();
        window.postMessage(
          {
            channel: 'tunnel-port',
            meta: { ...meta, isSender: false },
          },
          '*',
          [port1],
        );
        ev.source?.postMessage(
          { channel: 'tunnel-port', meta: { ...meta, isSender: true } },
          { transfer: [port2], targetOrigin: '*' },
        );
      }
    });
  }
}

export default TunnelPool;
