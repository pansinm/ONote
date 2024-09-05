#!/usr/bin/env node

const electronPath = require('electron');
const { spawn } = require('child_process');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const webpackConfig = require('../packages/renderer/webpack.config');
const path = require('path');

/** @type 'production' | 'development'' */
const mode = (process.env.MODE = process.env.MODE || 'development');

/** @type {import('vite').LogLevel} */
const LOG_LEVEL = 'info';

const logger = console;

/** Messages on stderr that match any of the contained patterns will be stripped from output */
const stderrFilterPatterns = [
  // warning about devtools extension
  // https://github.com/cawa-93/vite-electron-builder/issues/492
  // https://github.com/MarshallOfSound/electron-devtools-installer/issues/143
  /ExtensionLoadWarning/,
];

/**
 * @param {{name: string; configFile: string; writeBundle: import('rollup').OutputPlugin['writeBundle'] }} param0
 */
const getWatcher = ({ name, configFile, writeBundle }) => {
  const configuration = require(path.resolve(process.cwd(), configFile));
  return webpack(
    Object.assign({ watch: true }, configuration),
    (error, stats) => {
      logger.info('webpack build success');
      writeBundle();
    },
  );
};

const setupElectronPackageWatcher = ({ server }) => {
  // Create VITE_DEV_SERVER_URL environment variable to pass it to the main process.
  {
    const protocol = server.https ? 'https:' : 'http:';
    const host = server.host || 'localhost';
    const port = server.port || server.address().port; // Vite searches for and occupies the first free port: 3000, 3001, 3002 and so on
    const path = '/';
    process.env.DEV_SERVER_URL = `${protocol}//${host}:${port}${path}`;
  }

  /** @type {ChildProcessWithoutNullStreams | null} */
  let spawnProcess = null;

  return getWatcher({
    name: 'reload-app-on-main-package-change',
    configFile: 'packages/electron/webpack.config.js',
    writeBundle() {
      if (spawnProcess !== null) {
        spawnProcess.off('exit', process.exit);
        spawnProcess.kill('SIGKILL');

        spawnProcess = null;
      }

      spawnProcess = spawn(String(electronPath), ['.']);

      spawnProcess.stdout.on(
        'data',
        (d) =>
          d.toString().trim() && logger.warn(d.toString(), { timestamp: true }),
      );
      spawnProcess.stderr.on('data', (d) => {
        const data = d.toString().trim();
        if (!data) return;
        const mayIgnore = stderrFilterPatterns.some((r) => r.test(data));
        if (mayIgnore) return;
        logger.error(data, { timestamp: true });
      });

      // Stops the watch script when the application has been quit
      spawnProcess.on('exit', process.exit);
    },
  });
};

const compiler = webpack(webpackConfig);

(async () => {
  try {
    const server = new WebpackDevServer(webpack.devServer, compiler);
    await server.start();
    server.ws = {
      send: (ev) => {
        if (ev.type === 'full-reload') {
          server.sendMessage(server.sockets, 'content-changed');
        }
      },
    };
    await setupElectronPackageWatcher(server);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
