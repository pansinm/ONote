/* eslint-disable no-undef */
const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const entryPath = path.resolve(__dirname, 'src/entry');

const entry = fs.readdirSync(entryPath).reduce((pre, file) => {
  if (file === '__tests__') {
    return pre;
  }
  const basename = file.split('.').slice(0, -1).join('.');
  pre[basename] = path.resolve(entryPath, file);
  return pre;
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
  mode: isDev ? 'development' : 'production',
  entry: {
    ...entry,
    'editor.worker': 'monaco-editor/esm/vs/editor/editor.worker.js',
    'json.worker': 'monaco-editor/esm/vs/language/json/json.worker',
    'css.worker': 'monaco-editor/esm/vs/language/css/css.worker',
    'html.worker': 'monaco-editor/esm/vs/language/html/html.worker',
    'ts.worker': 'monaco-editor/esm/vs/language/typescript/ts.worker',
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
      {
        test: /\.s[ac]ss$/i,
        use: [
          // 将 JS 字符串生成为 style 节点
          'style-loader',
          // 将 CSS 转化成 CommonJS 模块
          'css-loader',
          // 将 Sass 编译成 CSS
          'sass-loader',
        ],
      },
      {
        test: /\.css$/i,
        use: [
          // 将 JS 字符串生成为 style 节点
          'style-loader',
          // 将 CSS 转化成 CommonJS 模块
          'css-loader',
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '/@': path.resolve(__dirname, 'src'),
    },
    fallback: {
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer/'),
    },
  },
  output: {
    globalObject: 'self',
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE': JSON.stringify(process.env.NODE_ENV),
      'process.env.DEBUG': JSON.stringify(process.env.DEBUG || false),
      'process.env.NODE_DEBUG': JSON.stringify(process.env.NODE_DEBUG || false),
    }),
    // new MonacoWebpackPlugin(),
    ...Object.keys(entry).map(
      (key) =>
        new HtmlWebpackPlugin({
          inject: 'body',
          template: __dirname + '/index.html',
          filename: key + '.html',
          chunks: [key],
        }),
    ),
  ],
  devServer: {
    // static: {
    //   directory: path.join(__dirname, 'public'),
    // },
    compress: true,
    port: 19000,
  },
  optimization: {
    minimize: false,
  },
};
