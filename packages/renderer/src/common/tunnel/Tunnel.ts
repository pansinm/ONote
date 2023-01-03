import EventEmitter from 'events';
import { uuid } from './utils';

type Meta = {
  messageId?: string;
  groupId?: string;
  clientId?: string;
  peerId?: string;
  type?: 'message' | 'request' | 'response';
  isError?: boolean;
  [key: string]: any;
};

type Message = {
  channel: string;
  payload: any;
  meta: Meta;
};

type Handler = (payload: any, meta: Meta) => Promise<any>;

class Tunnel {
  peerId: string;
  groupId: string;
  port?: MessagePort;
  disposed = false;
  clientId: string;

  private handlers: Record<string, Handler> = {};

  private emitter = new EventEmitter();

  private ready = false;

  private handlePortMessage = (ev: MessageEvent) => {
    const { channel, meta } = ev.data;
    if (
      channel === 'tunnel-port' &&
      meta?.isSender &&
      meta?.peerId === this.peerId
    ) {
      this.port = ev.ports[0];
      this.setupPort(this.port);
      window.removeEventListener('message', this.handlePortMessage);
    }
  };

  constructor(groupId: string, peerId: string, port?: MessagePort) {
    this.peerId = peerId;
    this.groupId = groupId;
    this.clientId = uuid();
    if (port) {
      this.setupPort(port);
    } else {
      window.addEventListener('message', this.handlePortMessage);
    }
  }

  async waitForReady() {
    if (this.ready) {
      return null;
    }
    return new Promise((resolve, reject) => {
      this.emitter.once('_ready', () => {
        resolve(null);
      });
    });
  }

  private setupPort(port: MessagePort) {
    this.emitter.emit('_ready');
    this.ready = true;
    port.addEventListener('message', (ev) => {
      const { channel, payload, meta } = ev.data;
      this.emitter.emit(channel, payload, meta);
    });
    port.addEventListener('close', () => {
      this.dispose();
    });
    port.start();
    this.port = port;
  }

  dispose() {
    if (this.disposed) {
      return;
    }
    this.disposed = true;
    if (this.port) {
      this.port.close();
    }
    this.port = undefined;
    this.emitter.removeAllListeners();
    this.handlers = {};
    window.removeEventListener('message', this.handlePortMessage);
  }
  on(channel: string, handler: (payload: any, meta: Meta) => void) {
    this.emitter.on(channel, handler);
    return {
      dispose: () => {
        this.emitter.off(channel, handler);
      },
    };
  }

  send(channel: string, payload: any, meta: Meta = {}) {
    const id = uuid('tunnel-msg');
    this.port?.postMessage({
      channel,
      payload,
      meta: Object.assign({ type: 'message' }, meta, {
        messageId: id,
        groupId: this.groupId,
        clientId: this.clientId,
        peerId: this.peerId,
      }),
    });
    return id;
  }

  handle(channel: string, handler: Handler) {
    if (this.handlers[channel]) {
      throw new Error(`Handler for ${channel} already exists`);
    }
    this.handlers[channel] = async (payload: any, meta: Meta) => {
      if (meta.type === 'request' && meta.peerId === this.peerId) {
        try {
          const res = await handler(payload, meta);
          this.send(channel, res, {
            type: 'response',
            requestId: meta.messageId,
          });
        } catch (err) {
          const error = err as Error;
          this.send(
            channel,
            {
              name: error.name,
              message: error.message,
              stack: error.stack,
            },
            { type: 'response', isError: true, requestId: meta.messageId },
          );
        }
      }
    };
    this.emitter.on(channel, this.handlers[channel]);
    return {
      dispose: () => {
        if (this.handlers[channel]) {
          this.emitter.off(channel, this.handlers[channel]);
          delete this.handlers[channel];
        }
      },
    };
  }

  async call(channel: string, payload: any = undefined) {
    return new Promise((resolve, reject) => {
      const messageId = this.send(channel, payload, {
        type: 'request',
      });
      const handleEvent = async (payload: any, meta: Meta) => {
        if (
          meta.requestId === messageId &&
          meta.type === 'response' &&
          meta.peerId === this.peerId
        ) {
          if (meta.isError) {
            reject(Object.assign(new Error(payload.message), payload));
          } else {
            resolve(payload);
          }
          this.emitter.off(channel, handleEvent);
        }
      };
      this.emitter.on(channel, handleEvent);
    });
  }
}

export default Tunnel;
