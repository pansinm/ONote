const fs = require('fs');
const path = require('path');

/**
 * afterPack — electron-builder 打包后钩子
 *
 * 将 CLI 独立二进制和平台 wrapper 脚本复制到安装包的 bin/ 目录。
 * 最终结构：
 *
 *   macOS: ONote.app/Contents/Resources/bin/onote-cli  (原生二进制)
 *          ONote.app/Contents/Resources/bin/onote       (shell wrapper)
 *
 *   Linux: resources/bin/onote-cli
 *          resources/bin/onote
 *
 *   Windows: resources/bin/onote-cli.exe
 *            resources/bin/onote.cmd
 */
exports.default = async function copyCliBinaries(context) {
  const platform = context.electronPlatformName;
  const appOutDir = context.appOutDir;

  let resourcesDir;
  if (platform === 'darwin') {
    resourcesDir = path.join(appOutDir, 'ONote.app', 'Contents', 'Resources');
  } else {
    resourcesDir = path.join(appOutDir, 'resources');
  }

  fs.mkdirSync(path.join(resourcesDir, 'bin'), { recursive: true });

  // ── 独立二进制 ──
  const binaryName = platform === 'win32' ? 'onote-cli.exe' : 'onote-cli';
  const binaryExt = platform === 'win32' ? 'onote-cli.exe' : 'onote-cli';
  const binarySource = path.join(__dirname, '..', 'packages', 'cli', 'dist', 'onote-cli');

  if (fs.existsSync(binarySource)) {
    const dest = path.join(resourcesDir, 'bin', binaryExt);
    fs.copyFileSync(binarySource, dest);
    fs.chmodSync(dest, 0o755);
  }

  // ── Wrapper 脚本 ──
  if (platform === 'win32') {
    const wrapperSource = path.join(__dirname, 'cli', 'onote.cmd');
    if (fs.existsSync(wrapperSource)) {
      fs.copyFileSync(wrapperSource, path.join(resourcesDir, 'bin', 'onote.cmd'));
    }
  } else {
    const wrapperSource = path.join(__dirname, 'cli', 'onote');
    if (fs.existsSync(wrapperSource)) {
      const dest = path.join(resourcesDir, 'bin', 'onote');
      fs.copyFileSync(wrapperSource, dest);
      fs.chmodSync(dest, 0o755);
    }
  }
};
