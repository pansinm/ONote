import { request, loadConfig } from '../client';

interface TreeNodeItem {
  name: string;
  uri: string;
  type: 'file' | 'directory';
  mtime?: number;
}

export async function searchCommand(query: string, options: { json?: boolean }) {
  const config = loadConfig();
  const res = await request<TreeNodeItem[]>('GET', `/search?q=${encodeURIComponent(query)}`, config);

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
    console.log(`No results for "${query}"`);
    return;
  }

  console.log(`Found ${items.length} result(s) for "${query}":\n`);
  for (const item of items) {
    const typeIcon = item.type === 'directory' ? '📁' : '📄';
    const mtime = item.mtime ? new Date(item.mtime).toLocaleString() : '';
    console.log(`  ${typeIcon}  ${item.name.padEnd(30)} ${mtime}`);
  }
}
