import { request, loadConfig } from '../client';

export async function mkdirCommand(path: string) {
  const config = loadConfig();
  const res = await request('POST', `/mkdir/${encodeURIComponent(path)}`, config);

  if (!res.ok) {
    console.error(`Error: ${res.error?.message || 'Unknown error'}`);
    process.exit(1);
  }

  console.log(`✓ Created directory ${path}`);
}
