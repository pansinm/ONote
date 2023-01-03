import Tunnel from './Tunnel';
import { uuid } from './utils';

class TunnelFactory {
  static createTunnelToMainFrame(groupId: string) {
    const peerId = uuid('peer-');
    const tunnel = new Tunnel(groupId, peerId);
    window.parent.postMessage(
      {
        channel: 'create-tunnel-port',
        meta: {
          groupId,
          peerId,
          clientId: tunnel.clientId,
        },
      },
      '*',
    );
    return tunnel;
  }
}

export default TunnelFactory;
