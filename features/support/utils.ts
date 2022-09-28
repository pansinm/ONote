import type { ElectronApplication, Page } from 'playwright';
import * as path from 'path';

export function getElectronApp() {
  return (global as any).electronApp as ElectronApplication;
}

export async function openMarkdown() {
  const electronApp = getElectronApp();
  const page = await electronApp.firstWindow();
  await page.click('text=打开目录');
  await page.waitForSelector('.ReactModal__Content');
  // in test:
  electronApp.evaluate(
    async ({ dialog }, filePaths) => {
      dialog.showOpenDialog = () =>
        Promise.resolve({ canceled: false, filePaths });
    },
    [process.cwd() + '/fixtures'],
  );
  await page.click('.ReactModal__Content >> text=打开目录');
  const root = 'text=fixtures';
  await page.waitForSelector(root);
  await page.click(root);
  await page.waitForSelector('text=empty.md');
  await page.click('text=empty.md');
  await page.waitForSelector('.monaco-mouse-cursor-text');
  await page.focus('.monaco-editor >> textarea');
  return page;
}

export const delay = (t: number) =>
  new Promise((resolve) => setTimeout(resolve, t));
