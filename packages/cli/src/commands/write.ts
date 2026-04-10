import { request, loadConfig } from '../client';
import * as fs from 'fs';

interface NoteMeta {
  uri: string;
  name: string;
  mtime?: number;
}

/**
 * 写入笔记
 *
 * 内容来源（优先级从高到低）：
 * 1. -c / --content 参数
 * 2. --file 参数指定的文件路径
 * 3. stdin（管道输入）
 */
export async function writeCommand(path: string, options: { content?: string; file?: string }) {
  const config = loadConfig();

  let content: string;

  if (options.content) {
    content = options.content;
  } else if (options.file) {
    content = fs.readFileSync(options.file, 'utf-8');
  } else if (!process.stdin.isTTY) {
    // stdin 管道
    content = await readStdin();
  } else {
    console.error('Error: Provide content via -c <text>, --file <path>, or pipe stdin');
    process.exit(1);
  }

  const res = await request<NoteMeta>('PUT', `/notes/${encodeURIComponent(path)}`, config, { content });

  if (!res.ok) {
    console.error(`Error: ${res.error?.message || 'Unknown error'}`);
    process.exit(1);
  }

  console.log(`✓ Written to ${path}`);
}

function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', (chunk) => { data += chunk; });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
  });
}
