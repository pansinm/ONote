import EventEmitter from 'events';

class Port extends EventEmitter {
  private port?: MessagePort;
  constructor() {
    window.addEventListener('message', (ev) => {
      const { type } = ev.data || {};
      if (type === 'port') {
        const port = ev.ports[0];
        if (port) {
          this.initPort(port);
        }
      }
    });
    window.parent.postMessage({ type: 'request-port' });
    super();
  }

  private initPort(port: MessagePort) {
    port.addEventListener('message', (event) => {
      const { type, payload } = event.data;
      this.emit(type, payload);
    });

    // 刷新主窗口时
    port.addEventListener('close', (e) => {
      port?.close();
      console.log('previewer port closed', e);
      setTimeout(
        () => window.parent.postMessage({ type: 'request-port' }),
        2000,
      );
      // window.parent.postMessage({ type: 'request-port' });
    });
    port.start();
    this.port = port;
  }
}

export default new Port();
