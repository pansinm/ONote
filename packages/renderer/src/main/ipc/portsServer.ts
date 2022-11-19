import { uniqueId } from 'lodash';
import type IPCMethod from '/@/common/ipc/IPCMethod';
import type { IPCEvent, IPCMessage } from '/@/common/ipc/types';

type RequestHandler = (payload: any) => Promise<any> | any;

type EventListener = (port: MessagePort, payload: any) => void;

class PortsServer {
  constructor() {
    this.handleRequestPort();
    this.handlePort();
  }

  private ports: MessagePort[] = [];

  private requestHandlers: {
    [type: string]: RequestHandler;
  } = {};

  private eventListeners: {
    [type: string]: EventListener[] | undefined;
  } = {};
  sendEvent(port: MessagePort, method: string, payload: any) {
    port.postMessage({
      method,
      payload,
      type: 'event',
      id: uniqueId('event-'),
    } as IPCMessage);
  }

  broadEvent(method: IPCMethod, payload: any, excludes: MessagePort[] = []) {
    this.ports
      .filter((port) => !excludes.includes(port))
      .forEach((port) => this.sendEvent(port, method, payload));
  }

  closeAll() {
    this.ports.forEach((p) => p.close());
    this.ports = [];
  }

  handleRequest(method: string, handler: (payload: any) => Promise<any>) {
    this.requestHandlers[method] = handler;
    return () => {
      delete this.requestHandlers[method];
    };
  }

  listenEvent(
    method: string,
    listener: (port: MessagePort, payload: any) => void,
  ) {
    const listeners = this.eventListeners[method];
    this.eventListeners[method] = listeners
      ? [...listeners, listener]
      : [listener];
    return () => {
      this.eventListeners[method] = this.eventListeners[method]?.filter(
        (i) => i !== listener,
      );
    };
  }

  private async reply(port: MessagePort, request: IPCMessage) {
    const { id, method, payload } = request;
    try {
      const handler = this.requestHandlers[method];
      if (!handler) {
        throw new Error(`handlers[${method}] not found!`);
      }
      const res = await handler(payload);
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

  private handleEvent(port: MessagePort, msg: IPCEvent) {
    const { method, payload } = msg;
    this.eventListeners[method]?.forEach((listener) => listener(port, payload));
  }

  private registerPort(port: MessagePort) {
    port.addEventListener('message', async (ev) => {
      const ipcMessage = ev.data as IPCMessage;
      const { type } = ipcMessage;
      if (type === 'request') {
        this.reply(port, ipcMessage);
      }
      if (type === 'event') {
        this.handleEvent(port, ev.data);
      }
    });
    const onClose = () => {
      port.close();
      console.log('main port closed');
      console.log('ports', this.ports.length);
      this.ports = this.ports.filter((p) => p !== port);
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
        console.log(event.source);
        event.source?.postMessage(
          { type: 'port' },
          { transfer: [port2], targetOrigin: '*' },
        );
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
