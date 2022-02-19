import type { RPCResponseData, RPCData } from './Protocol';

type Handler = (...args: any[]) => Promise<any>;
class Server {
  handlers: { [method: string]: Handler } = {};
  constructor() {
    window.addEventListener('message', this.onRequest);
  }

  private onRequest = (event: MessageEvent<any>) => {
    const data = event.data as RPCData;
    // console.log('receive', data);

    if (data.rpc === 'request') {
      const handler = this.handlers[data.method];
      if (!handler) {
        console.error('rpc 调用未注册');
        return;
      }
      handler(...data.args)
        .then((res) => {
          const resData: RPCResponseData = {
            rpc: 'response',
            method: data.method,
            reqId: data.reqId,
            res,
          };
          event.source?.postMessage(resData);
        })
        .catch((err) => {
          const resData: RPCResponseData = {
            rpc: 'response',
            method: data.method,
            reqId: data.reqId,
            error: err,
            res: undefined,
          };

          event.source?.postMessage(resData);
        });
    }
  };

  handle(method: string, handler: Handler) {
    this.handlers[method] = handler;
    return {
      dispose: () => {
        delete this.handlers[method];
      },
    };
  }

  dispose() {
    window.removeEventListener('message', this.onRequest);
  }
}

export default Server;
