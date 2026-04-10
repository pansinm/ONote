import { loadConfig, request } from '../client';

export async function statusCommand() {
  const config = loadConfig();

  console.log(`ONote API: http://${config.host}:${config.port}`);
  console.log(`User: ${config.username}`);

  try {
    const res = await request('GET', '/search?q=__ping__', config);
    if (res.ok || res.error?.code === 'VALIDATION_ERROR') {
      console.log('Status: ✓ Online');
    } else if (res.error?.code === 'UNAUTHORIZED') {
      console.log('Status: ✓ Online (auth failed — check credentials)');
    } else {
      console.log(`Status: ? Unexpected response: ${res.error?.message}`);
    }
  } catch (err) {
    console.log(`Status: ✗ Offline`);
    console.log(`  ${(err as Error).message}`);
  }
}
