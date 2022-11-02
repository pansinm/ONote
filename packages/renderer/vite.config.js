/* eslint-env node */

import { chrome } from '../../.electron-vendors.cache.json';
import { join } from 'path';
// import { viteCommonjs, esbuildCommonjs } from '@originjs/vite-plugin-commonjs';
import { builtinModules } from 'module';
import commonjs from 'vite-plugin-commonjs';
import react from '@vitejs/plugin-react';
import MonacoEditorNlsPlugin, {
  esbuildPluginMonacoEditorNls,
  Languages,
} from 'vite-plugin-monaco-editor-nls';

const PACKAGE_ROOT = __dirname;

const externals = [
  'fs-extra',
  '@hpcc-js/wasm',
  ...builtinModules
    .filter((e) => e !== 'events')
    .flatMap((p) => [p, `node:${p}`]),
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
    esbuildOptions: {
      // plugins: [esbuildCommonjs(['ohm-js'])],
      plugins: [esbuildPluginMonacoEditorNls({ locale: Languages.zh_hans })],
    },
  },
  plugins: [
    react(),
    commonjs(),
    MonacoEditorNlsPlugin({ locale: Languages.zh_hans }),
  ],
  base: '',
  server: {
    fs: {
      strict: true,
    },
    // hmr: {
    //   overlay: false,
    // },
  },
  build: {
    sourcemap: true,
    target: `chrome${chrome}`,
    outDir: 'dist',
    assetsDir: '.',
    rollupOptions: {
      input: {
        index: join(PACKAGE_ROOT, 'main.html'),
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
