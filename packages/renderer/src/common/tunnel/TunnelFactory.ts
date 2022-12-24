import { uniqueId } from 'lodash';
import Tunnel from './Tunnel';

class TunnelFactory {
  static createTunnelToMainFrame(groupId: string, peerId: string) {
    const tunnel = new Tunnel(groupId, peerId);
    window.parent.postMessage({
      channel: 'request-port',
      meta: {
        groupId,
        peerId,
        clientId: tunnel.clientId,
      },
    });
    return tunnel;
  }
}

export default TunnelFactory;
