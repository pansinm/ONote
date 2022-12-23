import { uniqueId } from 'lodash';

class TunnelFactory {
  static createTunnelToMainFrame(clientId: string) {
    window.parent.postMessage({
      type: 'request-payload',
      payload: {
        client: clientId,
        id: [
          uniqueId('tunnel'),
          Math.random().toString(36).toString().slice(2),
        ].join('-'),
      },
    });
  }
}

export default TunnelFactory;
