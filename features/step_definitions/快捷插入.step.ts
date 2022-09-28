import { When, Then, Before } from '@cucumber/cucumber';
import { getElectronApp, openMarkdown } from '../support/utils';

When('输入@时', async function () {
  // Write code here that turns the phrase above into concrete actions
  const page = await openMarkdown();
  await page.keyboard.type('@');
  this.page = page;
});

Then('提示插入日期', async function () {
  // Write code here that turns the phrase above into concrete actions
  await this.page.waitForSelector('text=插入日期');
  await this.page.click('.chrome-tab-close');
  await this.page.waitForSelector('.monaco-editor', { state: 'detached' });
});
