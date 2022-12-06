import { Given, Then, When } from '@cucumber/cucumber';
import type { ElectronApplication, Page } from 'playwright';
import { expect } from 'expect';

type World = {
  app: ElectronApplication;
  page: Page;
};

Given('打开目录', async function (this: World) {
  await this.page.waitForSelector('text=打开目录');
  console.log('click');
  await this.page.click('text="打开目录"', { force: true, delay: 50 });
  await this.page.waitForSelector('.fui-DialogBody');

  this.app.evaluate(
    async ({ dialog }, filePaths) => {
      dialog.showOpenDialog = () =>
        Promise.resolve({ canceled: false, filePaths });
    },
    [process.cwd() + '/fixtures'],
  );
  console.log('open');
  await this.page.click('.fui-DialogBody >> text=打开目录');
  const root = 'text=fixtures';
  await this.page.waitForSelector('text=d1');
  await this.page.click(root);
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

When('点击{string}', async function (this: World, name: string) {
  await this.page.waitForSelector(`text="${name}"`);
  await this.page.click(`text="${name}"`);
  await new Promise((resolve) => setTimeout(resolve, 100));
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

Then('使用系统应用打开', async function (this: World) {
  const focus = await this.app.evaluate(({ BrowserWindow }) =>
    BrowserWindow.getAllWindows()[0].isFocused(),
  );
  // const focus = await this.page.evaluate(() => document.hasFocus());
  expect(focus).toBe(false);
  // await this.app.evaluate(({ BrowserWindow }) =>
  //   BrowserWindow.getAllWindows()[0].focus(),
  // );
});

Then('目录按字典排序', async function (this: World) {
  const dirs: string = await this.page.evaluate(
    'document.querySelector(\'.file-tree\').innerText',
  );
  console.log(dirs);
  expect(dirs.split('\n')).toEqual(['fixtures', 'd1', 'd2']);
});
