import { waitFor } from '@testing-library/react';
import Tunnel from '../Tunnel';
import { uuid } from '../utils';

// todo: move to setup
window.MessageChannel = require('worker_threads').MessageChannel;

function postMessage(message, targetOrigin, transfer) {
  const event = window.document.createEvent('messageevent') as MessageEvent;
  event.initEvent('message');
  Object.defineProperty(event, 'data', {
    writable: true,
  });
  Object.defineProperty(event, 'ports', {
    writable: true,
  });
  const e = event as any;
  e._type = 'message';
  e.data = message;
  e.ports = transfer;

  this.dispatchEvent(event);
}

window.postMessage = postMessage.bind(window);

it('Tunnel disposed will be true when call dispose', () => {
  const t1 = new Tunnel('previewer', uuid());
  expect(t1.disposed).toBe(false);
  t1.dispose();
  expect(t1.disposed).toBe(true);
});

it('Tunnel state will be ready when received message port', () => {
  const { port1, port2 } = new window.MessageChannel();
  const tunnel = new Tunnel('test', uuid());
  expect(tunnel.waitForReady().then(() => tunnel.dispose())).resolves.toBe(
    undefined,
  );
  window.postMessage(
    {
      channel: 'port',
      meta: {
        clientId: '',
        peerId: tunnel.peerId,
      },
    },
    '*',
    [port1],
  );
});

it('trigger event when port receive message', async () => {
  const { port1, port2 } = new window.MessageChannel();
  const tunnel = new Tunnel('test', uuid());
  window.postMessage(
    {
      channel: 'port',
      meta: {
        peerId: tunnel.peerId,
      },
    },
    '*',
    [port1],
  );
  const fn = jest.fn();
  tunnel.on('message', fn);
  await tunnel.waitForReady();

  port2.postMessage({
    channel: 'message',
    payload: 'test',
    meta: {
      tunnelId: '22',
    },
  });
  await waitFor(() => {
    expect(fn).toHaveBeenCalledWith('test', { tunnelId: '22' }),
      tunnel.dispose();
  });
});

it('Tunnel will be disposed when port closed', async () => {
  const { port1, port2 } = new window.MessageChannel();
  const tunnel = new Tunnel('test', uuid());
  window.postMessage(
    {
      channel: 'port',
      meta: {
        peerId: tunnel.peerId,
      },
    },
    '*',
    [port1],
  );
  await tunnel.waitForReady();
  port2.close();
  await waitFor(() => expect(tunnel.disposed).toBe(true));
  tunnel.dispose();
});

it('call handle function to register handler', async () => {
  const { port1, port2 } = new window.MessageChannel();
  const tunnel = new Tunnel('test', uuid());
  window.postMessage(
    {
      channel: 'port',
      meta: {
        peerId: tunnel.peerId,
      },
    },
    '*',
    [port1],
  );
  const fn = jest.fn();
  tunnel.handle('test', fn);
  port2.postMessage({
    channel: 'test',
    meta: {
      type: 'request',
      tunnelId: tunnel.peerId,
      peerId: tunnel.peerId,
    },
  });
  await waitFor(() => expect(fn).toHaveBeenCalled());
  // can't register twice
  expect(() => tunnel.handle('test', fn)).toThrowError(/already exists/);
  tunnel.dispose();
});

it('tunnel can invoke peer handler', async () => {
  const { port1, port2 } = new window.MessageChannel();
  const tunnel1 = new Tunnel('test1', uuid());
  const tunnel2 = new Tunnel('test1', tunnel1.peerId);

  window.postMessage(
    {
      channel: 'port',
      meta: {
        clientId: tunnel1.clientId,
        groupId: 'test1',
        peerId: tunnel1.peerId,
      },
    },
    '*',
    [port1],
  );

  window.postMessage(
    {
      channel: 'port',
      meta: {
        clientId: tunnel2.clientId,
        groupId: 'test1',
        peerId: tunnel2.peerId,
      },
    },
    '*',
    [port2],
  );

  const fn = jest.fn();
  fn.mockResolvedValue('test result');
  const disposer = tunnel1.handle('test', fn);
  await tunnel1.waitForReady();
  await tunnel2.waitForReady();
  // fn.mockImplementationOnce(async () => 'test result');
  const res = await tunnel2.call('test', 'aabb');
  expect(res).toBe('test result');

  // dispose
  disposer.dispose();
  expect(tunnel2.call('test', 'aabb')).rejects.toThrow();

  tunnel1.handle('test', fn);
  fn.mockRejectedValue(new Error('failed'));

  try {
    await tunnel2.call('test', 'aabb');
  } catch (err) {
    expect(err.message).toBe('failed');
  }
  tunnel1.dispose();
  tunnel2.dispose();
});
