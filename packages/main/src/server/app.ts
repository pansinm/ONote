import express from 'express';
import { app as electronApp } from 'electron';
import path from 'path';
import multer from 'multer';
import { v2 as webdav } from 'webdav-server';
import os from 'os';
import fs from 'fs/promises';
import { sendToMain } from '../window/ipc';
import * as dsWebDav from './webdav';
import { dataSource } from '../dataSource';
const upload = multer({ dest: os.tmpdir() });

const app = express();

const userManager = new webdav.SimpleUserManager();
const user = userManager.addUser('webdav', 'webdav', false);

// Privilege manager (tells which users can access which files/folders)
const privilegeManager = new webdav.SimplePathPrivilegeManager();
privilegeManager.setRights(user, '/', ['all']);

const webdavServer = new webdav.WebDAVServer({
  rootFileSystem: new dsWebDav.FileSystem(),
  httpAuthentication: new webdav.HTTPBasicAuthentication(userManager),
  requireAuthentification: true,
  privilegeManager: privilegeManager,
  autoLoad: {
    // [...]
    serializers: [
      new dsWebDav.Serializer(),
      // [...]
    ],
  },
});

app.use(express.json({ limit: '100m' }));

const staticRoot = path.join(
  electronApp.getAppPath(),
  'packages/renderer/dist/',
);

app.use(express.static(staticRoot));

app.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    if (req.file) {
      const { originalname, path } = req.file;
      const { toFile } = req.body;
      const file = new URL('./assets/' + originalname, toFile).toString();
      await dataSource.write(file, await fs.readFile(path));
      sendToMain('message', {
        type: 'insert-file',
        payload: {
          uri: toFile,
          insertUri: file,
        },
      });
      res.send('Success!');
    }
  } catch (err) {
    next(err);
  }
});

app.use('/mobile', (req, res, next) => {
  res.sendFile(path.join(staticRoot, 'auxiliary.html'));
});

const useWebdav = webdav.extensions.express('/', webdavServer);
app.use((req, res, next) => {
  console.log(req.method, req.headers);
  next();
});
app.use((req, res, next) => {
  const _write = res.write.bind(res);
  if (req.method === 'PROPFIND' && req.headers.depth === undefined) {
    req.headers.depth = '1';
    res.write = (thunk, ...args: any[]) => {
      thunk = thunk.replace(/<(\/?)D:/g, '<$1d:').replace('xmlns:D', 'xmlns:d');
      // const content = (thunk as string).replace(
      //   /(<\/?d:)(response|href|displayname)>/gi,
      //   (str, p1: string, p2: string) => {
      //     return p1.toLocaleLowerCase() + p2.toLocaleLowerCase() + '>';
      //   },
      // );
      return _write(thunk, ...args);
    };
  }
  useWebdav(req, res, next);
});
export default app;
