import type { IPCMessage } from '/@/common/ipc/types';

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

  private async reply(port: MessagePort, request: IPCMessage) {
    const { id, method, payload } = request;
    try {
      const handler = this.handlers[method];
      if (!handler) {
        throw new Error(`handlers[${method}] not found!`);
      }
      const res = await handler(method, payload);
      port.postMessage({
        id,
        method: method,
        type: 'response',
        payload: res,
      } as IPCMessage);
    } catch (error) {
      const err = error as Error;
      port.postMessage({
        id,
        method: method,
        type: 'response',
        error: {
          name: err.name,
          message: err.message,
          stack: err.stack,
        },
      } as IPCMessage);
    }
  }

  private registerPort(port: MessagePort) {
    port.addEventListener('message', async (ev) => {
      const ipcMessage = ev.data as IPCMessage;
      const { type } = ipcMessage;
      if (type === 'request') {
        this.reply(port, ipcMessage);
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
