type Handler = (type: string, payload: any) => Promise<any> | any;

class PortsServer {
  constructor() {
    this.handleRequestPort();
    this.handlePort();
  }
  private ports: MessagePort[] = [];

  private handlers: {
    [type: string]: Handler;
  } = {};

  broadCast(message: any) {
    this.ports.forEach((port) => port.postMessage(message));
  }

  closeAll() {
    this.ports.forEach((p) => p.close());
    this.ports = [];
  }

  handle(type: string, handler: (payload: any) => Promise<any>) {
    this.handlers[type] = handler;
  }

  private registerPort(port: MessagePort) {
    port.addEventListener('message', async (ev) => {
      const { type, payload, id, msgType } = ev.data;
      const handler = this.handlers[type];
      if (handler && msgType === 'request') {
        try {
          const res = await handler(type, payload);
          port.postMessage({
            type,
            id,
            payload: res,
            msgType: 'response',
          });
        } catch (err) {
          const error = err as Error;
          port.postMessage({
            type,
            id,
            error: {
              name: error.name,
              message: error.message,
              stack: error.stack,
            },
            msgType: 'response',
          });
        }
      } else {
        const error = new Error('No handler found');
        port.postMessage({
          type,
          id,
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
          msgType: 'response',
        });
      }
    });
    const onClose = () => {
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

export default new PortsServer();
