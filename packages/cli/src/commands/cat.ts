import { request, loadConfig } from '../client';

interface NoteData {
  uri: string;
  name: string;
  content: string;
  mtime?: number;
}

export async function catCommand(path: string, options: { json?: boolean }) {
  const config = loadConfig();
  const res = await request<NoteData>('GET', `/notes/${encodeURIComponent(path)}`, config);

  if (!res.ok) {
    console.error(`Error: ${res.error?.message || 'Unknown error'}`);
    process.exit(1);
  }

  const note = res.data!;

  if (options.json) {
    console.log(JSON.stringify(note, null, 2));
    return;
  }

  // 直接输出内容——支持 pipe
  process.stdout.write(note.content);
}
