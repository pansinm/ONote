import { uriToPath } from '../uri';

it('uriToPath', () => {
  expect(
    uriToPath('file:///e%3A/%E5%B7%A5%E4%BD%9C%E6%A6%82%E8%A7%88/assets/a.svg'),
  ).toBe('/e:/工作概览/assets/a.svg');
  expect(
    uriToPath('file:///e:/%E5%B7%A5%E4%BD%9C%E6%A6%82%E8%A7%88/assets/a.svg'),
  ).toBe('/e:/工作概览/assets/a.svg');
});
