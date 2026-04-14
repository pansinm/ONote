/* eslint-disable no-undef */
const path = require('path');

/**
 * CLI webpack 配置
 *
 * 将所有 CLI 代码（含 commander）打包为单个 CommonJS 文件，
 * 作为 @yao-pkg/pkg 的输入，生成无 Node.js 依赖的独立二进制。
 *
 * 不 external 任何东西——commander、fs、http、path 全部打进 bundle。
 * Node 内置模块会被 pkg 注入的 Node runtime 兜底处理。
 */
module.exports = {
  cache: {
    type: 'filesystem',
    allowCollectingMemory: true,
  },
  target: 'node',
  mode: 'production',
  entry: path.resolve(__dirname, 'src/index.ts'),
  devtool: undefined,
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        loader: 'swc-loader',
        options: {
          module: { type: 'commonjs' },
          jsc: {
            parser: { syntax: 'typescript' },
            target: 'es2020',
          },
        },
      },
    ],
  },
  externalsPresets: { node: true },
  // commander 是唯一的第三方依赖，打包进 bundle。
  // 不用 external——pkg 的输入越自包含越好。
  externals: [],
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'cli.cjs',
    path: path.resolve(__dirname, 'dist'),
  },
  optimization: {
    minimize: false, // pkg 不需要压缩，调试友好
  },
};
