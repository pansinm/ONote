import path from 'node:path';
import os from 'node:os';
import { pathToFileURL } from 'node:url';
import fs from 'fs/promises';
import IpcHandler from '../IpcHandler';
import { uriToPath } from '/@/dataSource/providers/ssh/uri';

class TypstHandler extends IpcHandler {
  async compile(uri: string, content: string, format: string) {
    const name = path.basename(uriToPath(uri));
    const input = path.join(os.tmpdir(), +'onote-' + name);
    await fs.writeFile(input, content);
    const output = path.join(os.tmpdir(), +'onote-' + name + '.' + format);
    const cp = await import('child_process');
    const { reject, resolve, promise } = Promise.withResolvers();
    const process = cp.spawn('typst', ['compile', input, output]);
    let data = '';
    process.stdout.on('data', (chunk) => {
      data += chunk.toString();
    });
    process.stderr.on('data', (chunk) => {
      data += chunk.toString();
    });
    process.on('error', (err) => reject(err));
    process.on('close', (code) => {
      if (code === 0) {
        resolve(pathToFileURL(output).toString());
      } else {
        reject(new Error(data));
      }
    });
    return promise;
  }
}

export default TypstHandler;
