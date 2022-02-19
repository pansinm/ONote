import { v4 as uuid } from 'uuid';
import type { RPCData, RPCRequestData } from './Protocol';

class Client {
  private pools: { [id: string]: [(arg: any) => void, (arg: any) => void] } =
    {};

  target: Window;

  constructor(target: Window) {
    this.target = target;
    window.addEventListener('message', this.onResponse);
  }

  private onResponse = (event: MessageEvent<any>) => {
    const data = event.data as RPCData;
    if (data.rpc === 'response') {
      if (this.pools[data.reqId]) {
        const [resolve, reject] = this.pools[data.reqId];
        data.error ? reject(data.error) : resolve(data.res);
        delete this.pools[data.reqId];
      }
    }
  };

  call<T = unknown>(method: string, ...args: any[]) {
    // console.log('call', method, ...args);
    const id = uuid();
    return new Promise<T>((resolve, reject) => {
      this.pools[id] = [resolve, reject];
      const req: RPCRequestData = {
        rpc: 'request',
        reqId: id,
        args,
        method,
      };
      this.target.postMessage(req);
    });
  }

  dispose() {
    window.removeEventListener('message', this.onResponse);
  }
}

export default Client;
