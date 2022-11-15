import { EventEmitter } from 'events';
import { uniqueId } from 'lodash';
import { waitEvent } from '../../common/utils/async';
import type IPCMethod from '/@/common/ipc/IPCMethod';
import type { IPCMessage, IPCResponse } from '/@/common/ipc/types';

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

  async whenReady() {
    if (this.port) {
      return;
    }
    await waitEvent(this, 'ready');
  }

  private sendMessage(message: Omit<IPCMessage, 'id'>) {
    const id = uniqueId('previewer-');
    this.port?.postMessage({ ...message, id });
    return id;
  }

  async sendAndWait(method: IPCMethod, payload?: any) {
    await this.whenReady();
    const id = this.sendMessage({
      method,
      payload,
      type: 'request',
    });
    const res: IPCResponse = await waitEvent(
      this,
      method,
      (res) => res.id === id,
    );
    if (res.error) {
      throw new Error(res.error.message);
    }
    return res.payload;
  }

  async sendEvent(method: IPCMethod, payload?: any) {
    this.sendMessage({
      method,
      payload,
      type: 'event',
    });
  }

  private initPort(port: MessagePort) {
    port.addEventListener('message', (event) => {
      const { method } = event.data;
      this.emit(method, event.data);
    });

    // 刷新主窗口时
    port.addEventListener('close', (e) => {
      port?.close();
      this.port = undefined;
      console.log('previewer port closed', e);
      setTimeout(
        () => window.parent.postMessage({ type: 'request-port' }),
        2000,
      );
    });
    port.start();
    this.port = port;
    this.emit('ready');
  }
}

export default new Port();
