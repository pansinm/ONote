# ONote

## 主要特性
- 支持标准"Markdown"和Github风格语法
- 支持实时预览，双向同步滚动
- 支持ToC（Table of Contents）、Emoji表情、Task lists等扩展语法
- 支持TeX科学公式（基于KaTeX）、PlantUML、Mermaid Diagram;
- 支持插件扩展，当前包括图片标注、Drawio等插件
- 支持独立窗口预览，充分利用多屏，一屏编辑、一屏预览
- 支持Markdown模板，按模板创建新文件
- 支持多数据源，当前支持本地目录和SSH目录

## 目录
[TOC]

## 下载

[Release](https://github.com/pansinm/ONote/releases)

## Development

```bash
yarn watch
```

## Compile

### 编译前准备

#### Fedora
```bash
sudo dnf install libxcrypt-compat
sudo dnf install rpm-build
```

### 编译
```bash
yarn compile
```

## 依赖于

1. 脚手架 [vite-electron-builder](https://github.com/cawa-93/vite-electron-builder)
2. 编辑器 [monaco-editor](https://microsoft.github.io/monaco-editor/)
3. [Markdown AST](https://github.com/syntax-tree/mdast)
4. Graphviz 渲染 [@hpcc-js/wasm](https://github.com/hpcc-systems/hpcc-js-wasm)

## License

[MIT](LICENSE)
