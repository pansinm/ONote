/* eslint-disable no-undef */
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const isDev = process.env.NODE_ENV !== 'production';

const pkg = require('./package.json');

let externals = Object.keys(pkg.dependencies || {}).reduce((prev, name) => {
  if (name === 'typst') return prev;
  return Object.assign(prev, { [name]: 'commonjs ' + name });
}, {});
externals = [{ electron: 'commonjs electron', ...externals }];

console.log(externals);
/**
 * @type {import('webpack').Configuration}
 */
module.exports = {
  cache: {
    type: 'filesystem',
    allowCollectingMemory: true,
  },
  target: 'node',
  mode: isDev ? 'development' : 'production',
  entry: {
    index: path.resolve(__dirname, 'src/index.ts'),
    'preload/main': path.resolve(__dirname, 'src/preload/main.ts'),
    'preload/previewer': path.resolve(__dirname, 'src/preload/previewer.ts'),
  },
  devtool: isDev ? 'eval' : undefined,
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,

        loader: 'swc-loader',
        // exclude: {
        //   and: [/node_modules/, { not: /typst/ }],
        // },
        options: {
          module: {
            type: 'commonjs',
          },
          jsc: {
            parser: {
              syntax: 'typescript',
              // tsx: true,
            },
            target: 'es2019',
          },
        },
      },
    ],
  },
  externalsPresets: { node: true, electron: true },
  externals,
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '/@': path.resolve(__dirname, 'src'),
    },
  },
  output: {
    filename: '[name].cjs',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [],
};
