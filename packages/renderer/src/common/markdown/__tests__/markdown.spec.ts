import { html2md } from '../';

it('test html2md', () => {
  expect(html2md('<ul><li>test1</li></ul>')).toBe('- test1');
  expect(html2md('<p><mark id="test"><span>text</span></p>')).toBe(
    ':mark[text]{#test}',
  );
});
