/* eslint-disable no-undef */
const path = require('path');
const fs = require('fs');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const entryPath = path.resolve(__dirname, 'src/entry');

const entry = fs.readdirSync(entryPath).reduce((pre, file) => {
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
  entry: entry,
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
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[contenthash].js',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.NODE': JSON.stringify(process.env.NODE_ENV),
      'process.env.DEBUG': JSON.stringify(process.env.DEBUG || false),
      'process.env.NODE_DEBUG': JSON.stringify(process.env.NODE_DEBUG || false),
    }),
    new MonacoWebpackPlugin(),
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
    port: 9000,
  },
  optimization: {
    minimize: false,
  },
};
