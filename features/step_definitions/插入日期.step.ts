import { When, Then, Before } from '@cucumber/cucumber';
import * as expect from 'expect';
import { delay, openMarkdown } from '../support/utils';
// import { getElectronApp, openMarkdown } from '../support/utils';

When('点击@提示的插入日期', async function () {
  const page = await openMarkdown();
  await page.keyboard.type('@');
  await page.waitForSelector('text=插入日期', {
    state: 'attached',
  });
  await page.click('text=插入日期');
  this.value = await page.evaluate('monaco.editor.getModels()[0].getValue()');
  console.log(this.value);
});

Then('编辑器插入当天日期', async function () {
  // Write code here that turns the phrase above into concrete actions
  expect(this.value).toMatch(new Date().toLocaleDateString());
});
