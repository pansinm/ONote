/* eslint-env node */

import { chrome } from '../../.electron-vendors.cache.json';
import { join } from 'path';
import { builtinModules } from 'module';
import react from '@vitejs/plugin-react';

const PACKAGE_ROOT = __dirname;

const externals = [
  'fs-extra',
  '@hpcc-js/wasm',
  ...builtinModules.flatMap((p) => [p, `node:${p}`]),
];


/**
 * @type {import('vite').UserConfig}
 * @see https://vitejs.dev/config/
 */
const config = {
  mode: process.env.MODE,
  root: PACKAGE_ROOT,
  resolve: {
    alias: {
      '/@/': join(PACKAGE_ROOT, 'src') + '/',
    },
  },
  optimizeDeps: {
    include: ['lodash/lodash.js'],
  },
  plugins: [react()],
  base: '',
  server: {
    fs: {
      strict: true,
    },
  },
  build: {
    sourcemap: true,
    target: `chrome${chrome}`,
    outDir: 'dist',
    assetsDir: '.',
    rollupOptions: {
      input: {
        index: join(PACKAGE_ROOT, 'index.html'),
        previewer: join(PACKAGE_ROOT, 'previewer.html'),
      },
      external: [...externals],
    },
    emptyOutDir: true,
    brotliSize: false,
  },
  test: {
    environment: 'happy-dom',
  },
  define: {
    'process.env': {},
  },
};

export default config;
