/* eslint-disable no-undef */
const path = require('path');

const pkg = require('../../package.json');
const nodeExternals = require('webpack-node-externals');
const externals = Object.keys(pkg.dependencies || {}).reduce((prev, name) => {
  return Object.assign(prev, { name: 'commonjs ' + name });
}, {});

const isDev = process.env.NODE_ENV !== 'production';

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
    main: path.resolve(__dirname, 'src/main.ts'),
    previewer: path.resolve(__dirname, 'src/previewer.ts'),
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
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '/@': path.resolve(__dirname, 'src'),
    },
  },
  externals: [nodeExternals()],
  output: {
    filename: '[name].cjs',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [],
};
