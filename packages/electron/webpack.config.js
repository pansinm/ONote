/* eslint-disable no-undef */
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const isDev = process.env.NODE_ENV !== 'production';

const pkg = require('./package.json');

const externals = Object.keys(pkg.dependencies || {}).reduce((prev, name) => {
  return Object.assign(prev, { [name]: 'commonjs ' + name });
}, {});

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
        test: /\.tsx?$/,
        loader: 'swc-loader',
        exclude: /node_modules/,
        options: {
          jsc: {
            parser: {
              syntax: 'typescript',
              tsx: true,
            },
          },
        },
      },
    ],
  },
  externalsPresets: { node: true, electron: true },
  externals: [nodeExternals(), { electron: 'commonjs electron', ...externals }],
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
