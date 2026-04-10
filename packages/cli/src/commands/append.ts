import { request, loadConfig } from '../client';

export async function appendCommand(path: string, options: { content: string }) {
  const config = loadConfig();

  const res = await request('POST', `/notes/${encodeURIComponent(path)}/append`, config, {
    content: options.content,
  });

  if (!res.ok) {
    console.error(`Error: ${res.error?.message || 'Unknown error'}`);
    process.exit(1);
  }

  console.log(`✓ Appended to ${path}`);
}
