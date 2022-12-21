import express from 'express';
import { app as electronApp } from 'electron';
import path from 'path';
import multer from 'multer';
import os from 'os';
import fs from 'fs/promises';
import { manager } from '../dataSource';
import { sendToMain } from '../window/ipc';

const upload = multer({ dest: os.tmpdir() });

const app = express();

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
      const dataSource = manager.getDataSource('current');
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

export default app;
