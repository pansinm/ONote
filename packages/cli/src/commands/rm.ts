import { request, loadConfig } from '../client';

export async function rmCommand(path: string) {
  const config = loadConfig();
  const res = await request('DELETE', `/notes/${encodeURIComponent(path)}`, config);

  if (!res.ok) {
    console.error(`Error: ${res.error?.message || 'Unknown error'}`);
    process.exit(1);
  }

  console.log(`✓ Deleted ${path}`);
}
