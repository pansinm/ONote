import { Given, Then, When } from '@cucumber/cucumber';
import type { ElectronApplication, Page } from 'playwright';
import { expect } from 'expect';

type World = {
  app: ElectronApplication;
  page: Page;
};

Given('打开目录', async function (this: World) {
  await this.page.click('text=打开目录');
  await this.page.waitForSelector('.ReactModal__Content');

  this.app.evaluate(
    async ({ dialog }, filePaths) => {
      dialog.showOpenDialog = () =>
        Promise.resolve({ canceled: false, filePaths });
    },
    [process.cwd() + '/fixtures'],
  );

  await this.page.click('.ReactModal__Content >> text=打开目录');
  const root = 'text=fixtures';
  await this.page.waitForSelector(root);
  await this.page.click(root);
  await this.page.waitForSelector('text=empty.md');
});

When('打开文件{string}', async function (this: World, filename: string) {
  await this.page.click(`text=${filename}`);
  await this.page.waitForSelector('.chrome-tabs');
  if (
    await this.page.evaluate(
      'document.querySelector(".editor-container").getBoundingClientRect().height > 0',
    )
  ) {
    await this.page.waitForSelector('.monaco-editor >> textarea');
    await this.page.focus('.monaco-editor >> textarea');
  }
});

Then('打开的页面是编辑页面', async function (this: World) {
  await this.page.waitForSelector('iframe', { state: 'attached' });
  await this.page.waitForSelector('.monaco-editor', { state: 'attached' });
});

Then('页面提示使用系统应用打开', async function (this: World) {
  await this.page.waitForSelector('text=使用系统应用打开', {
    state: 'attached',
  });
});

Then('目录按字典排序', async function (this: World) {
  const dirs: string = await this.page.evaluate(
    'document.querySelector(\'.file-tree\').innerText',
  );
  expect(dirs.split('\n')).toEqual(['fixtures', 'd1', 'd2']);
});
