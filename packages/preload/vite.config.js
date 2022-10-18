import { chrome } from '../../.electron-vendors.cache.json';
import { builtinModules } from 'module';
import { resolve } from 'path';

const PACKAGE_ROOT = __dirname;

/**
 * @type {import('vite').UserConfig}
 * @see https://vitejs.dev/config/
 */
const config = {
  mode: process.env.MODE,
  root: PACKAGE_ROOT,
  envDir: process.cwd(),
  build: {
    sourcemap: 'inline',
    target: `chrome${chrome}`,
    outDir: 'dist',
    assetsDir: '.',
    minify: process.env.MODE !== 'development',
    lib: {
      entry: ['src/main.ts', 'src/previewer.ts'],
      formats: ['cjs'],
    },
    rollupOptions: {
      external: [
        'electron',
        'electron/main',
        '@hpcc-js/wasm',
        ...builtinModules.flatMap((p) => [p, `node:${p}`]),
      ],
      input: [
        resolve(__dirname, 'src/main.ts'),
        resolve(__dirname, 'src/previewer.ts'),
      ],
      output: {
        entryFileNames: '[name].cjs',
      },
    },
    emptyOutDir: true,
    brotliSize: false,
  },
};

export default config;
