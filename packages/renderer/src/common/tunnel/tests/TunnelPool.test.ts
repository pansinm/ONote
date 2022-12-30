import { waitFor } from '@testing-library/react';
import TunnelPool from '../TunnelPool';

it('TunnelPool will trigger new event when receive tunnel-port event', async () => {
  const tunnelPool = new TunnelPool();
  const fn = jest.fn();
  tunnelPool.on('new', fn);
  const { port1, port2 } = new window.MessageChannel();
  window.postMessage(
    {
      channel: 'tunnel-port',
      meta: {
        groupId: 'groupId',
        peerId: 'peerId',
        isSender: false,
      },
    },
    '*',
    [port1],
  );
  await waitFor(() => expect(fn).toBeCalledTimes(1));
});
