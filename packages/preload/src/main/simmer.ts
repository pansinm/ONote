import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import * as mimetypes from 'mime-types';
import { fileURLToPath, pathToFileURL } from 'url';
import type { Engine } from '@hpcc-js/wasm';
import { graphviz } from '@hpcc-js/wasm';
import * as https from 'https';
import * as http from 'http';
import { encode as encodePlantUML } from 'plantuml-encoder';
import type { Dialog, NativeImage } from 'electron';
import { shell } from 'electron';
import { ipcRenderer } from 'electron';
import { clipboard, nativeImage } from 'electron';
import { exposeInMainWorld } from './exposeInMainWorld';
import { internalIpV4 } from 'internal-ip';
import { callDataSource } from '../ipc/dataSource';
import { callPlugin } from '../ipc/plugin';
import { callSetting } from '../ipc/setting';
import { callDevelop } from '../ipc/develop';
import { nodeCrypto } from '../common/nodeCrypto';

// Export for types in contracts.d.ts
export const simmer = {
  localIpV4() {
    return internalIpV4();
  },
  /**
   * 删除目录或文件
   * @param path
   */
  async remove(path: string) {
    await fs.rm(path, { recursive: true });
  },

  async invokeIpc(channel: string, ...args: any[]): Promise<unknown> {
    return ipcRenderer.invoke(channel, ...args);
  },

  homedir() {
    return os.homedir();
  },

  callDataSource: callDataSource,
  callPlugin: callPlugin,
  callSetting: callSetting,
  callDevelop: callDevelop,

  postMessageToPreviewerWindow(message: any) {
    ipcRenderer.send('window', 'postMessageToPreviewer', message);
  },

  showPreviewerWindow() {
    ipcRenderer.send('window', 'showPreviewerWindow');
  },

  renderGraphviz(dot: string, engine: Engine) {
    return graphviz.layout(dot, 'svg', engine);
  },
  openDirectory() {
    return ipcRenderer.invoke('open-directory') as ReturnType<
      Dialog['showOpenDialog']
    >;
  },
  async readBlobsFromClipboard() {
    const uriList = clipboard.read('text/uri-list');
    const uris = uriList.trim().split(/\s+/);
    console.log(uris);
    return Promise.all(
      uris
        .map((uri) => fileURLToPath(uri))
        .map((localPath) =>
          fs.readFile(localPath).then(
            (buffer) =>
              new Blob([buffer], {
                type: mimetypes.lookup(path.basename(localPath)) || undefined,
              }),
          ),
        ),
    );
  },
  async readImageFromClipboard() {
    const img = clipboard.readImage();
    if (img.isEmpty()) {
      return false;
    }
    return new Blob([img.toPNG()], { type: 'image/png' });
  },
  async renderPlantUML(
    plantuml: string,
    endpoint: string,
    useCache = false,
  ): Promise<string[]> {
    if (useCache) {
      const id = nodeCrypto.md5(plantuml);
      const cacheFilePath = path.join(os.tmpdir(), 'puml-' + id);
      try {
        const cacheFile = await fs.readFile(cacheFilePath, 'utf-8');
        return JSON.parse(cacheFile);
      } catch (err) {
        const res = await renderPlantUMLToSvg(plantuml, endpoint);
        fs.writeFile(cacheFilePath, JSON.stringify(res));
        return res;
      }
    }
    return renderPlantUMLToSvg(plantuml, endpoint);
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
    const localPath = await callDataSource('current', 'cache', uri);
    shell.openExternal(pathToFileURL(localPath).toString());
  },
};

exposeInMainWorld('simmer', simmer);
function renderPlantUMLToSvg(
  plantuml: string,
  endpoint: string,
): Promise<string[]> {
  const encodedUML = encodePlantUML(plantuml);
  const getPage = (page: number) => {
    const index = page - 1;
    const url =
      endpoint + '/svg/' + (index > 0 ? index + '/' : '') + encodedUML;
    return new Promise((resolve, reject) => {
      (endpoint.startsWith('https') ? https : http)
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
  };
  const pagescount = plantuml.split('newpage').length;
  const promises = new Array(pagescount)
    .fill(0)
    .map((_, index) => index + 1)
    .map((page) => getPage(page));
  return Promise.all(promises as Promise<string>[]);
}
