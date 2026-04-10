import { request, loadConfig } from '../client';

interface NoteMeta {
  uri: string;
  name: string;
  mtime?: number;
}

export async function mvCommand(source: string, dest: string) {
  const config = loadConfig();

  // 如果 dest 以 / 结尾，视为移动到目录
  const res = await request<NoteMeta>('POST', `/notes/${encodeURIComponent(source)}/move`, config, {
    targetDir: dest,
  });

  if (!res.ok) {
    console.error(`Error: ${res.error?.message || 'Unknown error'}`);
    process.exit(1);
  }

  console.log(`✓ Moved ${source} → ${dest}`);
}
