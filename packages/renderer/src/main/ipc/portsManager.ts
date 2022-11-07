class PortsManager {
  constructor() {
    this.handleRequestPort();
    this.handlePort();
  }
  private ports: MessagePort[] = [];

  broadCast(message: any) {
    this.ports.forEach((port) => port.postMessage(message));
  }

  closeAll() {
    this.ports.forEach((p) => p.close());
    this.ports = [];
  }

  private registerPort(port: MessagePort) {
    port.addEventListener('message', (ev) => {
      console.log('receive port message', ev);
    });
    const onClose = () => {
      port.removeEventListener('close', onClose);
      port.close();
      console.log('main port closed');
      console.log('ports', this.ports.length);
      this.ports = this.ports.filter((p) => p !== port);
      console.log(this.ports.length, this.ports);
    };
    port.addEventListener('close', onClose);
    port.start();
    this.ports.push(port);
  }

  private handleRequestPort() {
    window.addEventListener('message', (event) => {
      const { type } = event.data;
      if (type === 'request-port') {
        const { port1, port2 } = new MessageChannel();
        window.postMessage(
          {
            type: 'port',
          },
          '*',
          [port1],
        );
        event.source?.postMessage({ type: 'port' }, { transfer: [port2] });
      }
    });
  }

  private handlePort() {
    window.addEventListener('message', (ev) => {
      const { type } = ev.data || {};
      if (type === 'port') {
        const port = ev.ports[0];
        port && this.registerPort(ev.ports[0]);
      }
    });
  }
}

export default new PortsManager();
