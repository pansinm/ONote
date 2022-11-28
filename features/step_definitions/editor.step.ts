import { When, Then } from '@cucumber/cucumber';
import type { Page } from 'playwright';
import { expect } from 'expect';
// import { getElectronApp, openMarkdown } from '../support/utils';

type World = {
  page: Page;
};

When('编辑器输入{string}', async function (this: World, text) {
  // Write code here that turns the phrase above into concrete actions
  await this.page.keyboard.type(text);
});

Then('代码提示{string}', async function (this: World, text) {
  await this.page.waitForSelector(`.suggest-widget >> text="${text}"`);
  await this.page.click('.chrome-tab-close');
  await this.page.waitForSelector('.monaco-editor', { state: 'detached' });
});

When('点击代码提示{string}', async function (this: World, text: string) {
  const selector = `.suggest-widget >> text="${text}"`;
  await this.page.waitForSelector(selector);
  await this.page.click(selector);
});

Then('编辑器插入当天日期', async function (this: World) {
  const value = await this.page.evaluate(
    'monaco.editor.getModels()[0].getValue()',
  );
  // Write code here that turns the phrase above into concrete actions
  expect(value).toMatch(new Date().toLocaleDateString());
});

When('点击命令面板{string}', async function (this: World, text: string) {
  const selector = `.quick-input-widget >> text=${text}`;
  await this.page.waitForSelector(selector, { state: 'visible' });
  await this.page.click(selector);
});

When('打开命令面板', async function (this: World) {
  await this.page.keyboard.press('F1');
  await this.page.waitForSelector('.quick-input-widget', { state: 'visible' });
});
