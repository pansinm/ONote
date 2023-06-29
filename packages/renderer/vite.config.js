/* eslint-env node */

import { chrome } from '../../.electron-vendors.cache.json';
import { join } from 'path';
// import { viteCommonjs, esbuildCommonjs } from '@originjs/vite-plugin-commonjs';
import { builtinModules } from 'module';
import commonjs from 'vite-plugin-commonjs';
import react from '@vitejs/plugin-react';
// import MonacoEditorNlsPlugin, {
//   esbuildPluginMonacoEditorNls,
//   Languages,
// } from 'vite-plugin-monaco-editor-nls';

// const zh_CN = require('vscode-loc/i18n/vscode-language-pack-zh-hans/translations/main.i18n.json');

const PACKAGE_ROOT = __dirname;

const externals = [
  'fs-extra',
  '@hpcc-js/wasm',
  'default-gateway',
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
      plugins: [
        // esbuildPluginMonacoEditorNls({
        //   locale: Languages.zh_hans,
        //   localeData: zh_CN.contents,
        // }),
      ],
    },
  },
  plugins: [
    react(),
    commonjs(),
    // MonacoEditorNlsPlugin({
    //   locale: Languages.zh_hans,
    //   localeData: zh_CN.contents,
    // }),
  ],
  base: '',
  server: {
    fs: {
      strict: true,
    },
    proxy: {
      '/upload': 'http://localhost:21221',
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
        auxiliary: join(PACKAGE_ROOT, 'auxiliary.html'),
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
