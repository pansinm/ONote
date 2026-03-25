const fs = require('fs');
const path = require('path');

exports.default = async function(context) {
  const platform = context.electronPlatformName;
  const appPath = context.appOutDir;

  if (platform === 'darwin') {
    const cliSource = path.join(__dirname, 'cli', 'onote');
    const cliDest = path.join(appPath, 'ONote.app', 'Contents', 'Resources', 'bin', 'onote');
    fs.mkdirSync(path.dirname(cliDest), { recursive: true });
    fs.copyFileSync(cliSource, cliDest);
    fs.chmodSync(cliDest, 0o755);
  } else if (platform === 'linux') {
    const cliSource = path.join(__dirname, 'cli', 'onote');
    const cliDest = path.join(appPath, 'resources', 'bin', 'onote');
    fs.mkdirSync(path.dirname(cliDest), { recursive: true });
    fs.copyFileSync(cliSource, cliDest);
    fs.chmodSync(cliDest, 0o755);
  } else if (platform === 'win32') {
    const cliSource = path.join(__dirname, 'cli', 'onote.cmd');
    const cliDest = path.join(appPath, 'resources', 'bin', 'onote.cmd');
    fs.mkdirSync(path.dirname(cliDest), { recursive: true });
    fs.copyFileSync(cliSource, cliDest);
  }
};
