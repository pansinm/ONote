import { Given } from '@cucumber/cucumber';
import type { Page } from 'playwright';
import { openMarkdown } from '../support/utils';

type World = {
  page: Page;
};

Given('打开markdown文件', async function (this: World) {
  await openMarkdown();
});
