import { request, loadConfig, type ClientConfig } from '../client';
import type { ApiResponse } from '../client';

interface TreeNodeItem {
  name: string;
  uri: string;
  type: 'file' | 'directory';
  mtime?: number;
}

export async function listCommand(path: string | undefined, options: { json?: boolean }) {
  const config = loadConfig();
  const queryPath = path ? `?path=${encodeURIComponent(path)}` : '';
  const res = await request<TreeNodeItem[]>('GET', `/notes${queryPath}`, config);

  if (!res.ok) {
    console.error(`Error: ${res.error?.message || 'Unknown error'}`);
    process.exit(1);
  }

  const items = res.data || [];

  if (options.json) {
    console.log(JSON.stringify(items, null, 2));
    return;
  }

  if (items.length === 0) {
    console.log('(empty)');
    return;
  }

  // 人类可读的表格输出
  for (const item of items) {
    const typeIcon = item.type === 'directory' ? '📁' : '📄';
    const mtime = item.mtime ? new Date(item.mtime).toLocaleString() : '';
    console.log(`${typeIcon}  ${item.name.padEnd(30)} ${mtime}`);
  }
}
