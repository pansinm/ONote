import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import type { Engine } from '@hpcc-js/wasm';
import { graphviz } from '@hpcc-js/wasm';
import * as https from 'https';
import { encode as encodePlantUML } from 'plantuml-encoder';
import type { Dialog, NativeImage } from 'electron';
import { shell } from 'electron';
import { ipcRenderer } from 'electron';
import { clipboard, nativeImage } from 'electron';
import { exposeInMainWorld } from './exposeInMainWorld';
import { fileService } from './fileService';

const ensureDir = async (dir: string) => {
  const exists = await fs
    .access(dir)
    .then(() => true)
    .catch(() => false);
  if (!exists) {
    await fs.mkdir(dir, { recursive: true });
  }
};
// Export for types in contracts.d.ts
export const simmer = {
  ensureDir,

  /**
   * 删除目录或文件
   * @param path
   */
  async remove(path: string) {
    await fs.rm(path, { recursive: true });
  },

  async writeFile(
    filePath: string,
    content: any,
    encoding: BufferEncoding = 'utf-8',
  ) {
    const parent = path.dirname(filePath);
    await ensureDir(parent);
    await fs.writeFile(filePath, content, encoding);
  },

  readFile(filePath: string, encoding: BufferEncoding = 'utf-8') {
    return fs.readFile(filePath, encoding);
  },

  homedir() {
    return os.homedir();
  },

  renderGraphviz(dot: string, engine: Engine) {
    return graphviz.layout(dot, 'svg', engine);
  },
  openDirectory() {
    return ipcRenderer.invoke('open-directory') as ReturnType<
      Dialog['showOpenDialog']
    >;
  },
  async renderPlantUML(plantuml: string, endpoint: string) {
    const encodedUML = encodePlantUML(plantuml);
    const url = endpoint + '/svg/' + encodedUML;
    return new Promise((resolve, reject) => {
      https
        .get(url, (res) => {
          let data = '';
          res.on('data', (thunk) => {
            data += thunk;
          });
          res.on('end', () => resolve(data));
          res.on('error', (err) => reject(err));
        })
        .on('error', (err) => {
          reject(err);
        });
    });
  },
  async copyImage(content: any, type: 'dataURL' | 'ArrayBuffer') {
    let img: NativeImage;
    console.log(content, type);
    if (type === 'dataURL') {
      img = nativeImage.createFromDataURL(content);
    } else {
      img = nativeImage.createFromBuffer(content);
    }
    const buf = img.toPNG();
    clipboard.writeBuffer('image/png', buf);
    // 部分应用通过uri-list读取图片
    const filePath = path.join(
      os.tmpdir(),
      Math.random().toString(36).slice(2) + '.png',
    );
    await fs.writeFile(filePath, buf);
    const urlPath = filePath.startsWith('/') ? filePath : '/' + filePath;
    const url = new URL(`file://${urlPath}`).href + '\r\n';
    clipboard.writeBuffer('text/uri-list', Buffer.from(url, 'utf-8'));
  },
  async openExternal(uri: string) {
    const localUri = await fileService.getLocalUri(uri);
    shell.openExternal(localUri);
  },
};

exposeInMainWorld('simmer', simmer);
