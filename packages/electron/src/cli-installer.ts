import { dialog } from 'electron';
import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { getLogger } from '/@/shared/logger';

const logger = getLogger('cli-installer');

export async function checkAndPromptCliInstall() {
  if (process.platform === 'win32') {
    return;
  }

  const cliInstalled = await isCliInstalled();
  if (cliInstalled) return;

  const hasPrompted = getCliPromptFlag();
  if (hasPrompted) return;

  const result = await dialog.showMessageBox({
    type: 'question',
    buttons: ['安装', '稍后', '不再提示'],
    defaultId: 0,
    title: 'ONote CLI 工具',
    message: '是否安装 onote 命令行工具？',
    detail: '安装后可以在终端使用 onote 命令启动应用或打开文件。',
  });

  if (result.response === 0) {
    await installCli();
  } else if (result.response === 2) {
    setCliPromptFlag(true);
  }
}

async function isCliInstalled(): Promise<boolean> {
  return new Promise((resolve) => {
    exec('which onote', (error) => {
      resolve(!error);
    });
  });
}

async function installCli() {
  const appPath = process.resourcesPath;
  const cliSource = path.join(appPath, 'bin', 'onote');

  if (!fs.existsSync(cliSource)) {
    logger.error('CLI tool not found', { cliSource });
    dialog.showErrorBox('错误', 'CLI 工具文件不存在');
    return;
  }

  exec(`sudo ln -sf "${cliSource}" /usr/local/bin/onote`, (error) => {
    if (error) {
      logger.error('Failed to install CLI', error);
      dialog.showErrorBox('安装失败', `请手动执行:\nsudo ln -s "${cliSource}" /usr/local/bin/onote`);
    } else {
      logger.info('CLI installed successfully');
      dialog.showMessageBox({
        type: 'info',
        title: '安装成功',
        message: 'CLI 工具已安装，现在可以使用 onote 命令了！',
      });
    }
  });
}

function getCliPromptFlag(): boolean {
  const flagPath = getCliPromptFlagPath();
  return fs.existsSync(flagPath);
}

function setCliPromptFlag(value: boolean) {
  const flagPath = getCliPromptFlagPath();
  if (value) {
    fs.mkdirSync(path.dirname(flagPath), { recursive: true });
    fs.writeFileSync(flagPath, '');
  } else {
    if (fs.existsSync(flagPath)) {
      fs.unlinkSync(flagPath);
    }
  }
}

function getCliPromptFlagPath(): string {
  const userDataPath = process.env.HOME || process.env.USERPROFILE || '';
  return path.join(userDataPath, '.onote', 'cli-prompt-flag');
}

