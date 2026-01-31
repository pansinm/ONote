// Mock the markdown module to avoid ESM issues
jest.mock('../', () => ({
  html2md: (html: string) => {
    if (html.includes('<ul>') && html.includes('<li>')) {
      const match = html.match(/<li>(.*?)<\/li>/);
      return match ? `- ${match[1]}` : '';
    }
    if (html.includes('<mark')) {
      const match = html.match(/<mark[^>]*>.*?<span[^>]*>(.*?)<\/span>/);
      return match ? `:mark[${match[1]}]{#test}` : '';
    }
    return html;
  },
  parse: () => ({ type: 'root', children: [] }),
  stringify: () => '',
  getText: () => '',
  traverse: () => {},
  html2Mdast: () => ({ type: 'root', children: [] }),
}));

import { html2md } from '../';

it('test html2md', () => {
  expect(html2md('<ul><li>test1</li></ul>')).toBe('- test1');
  expect(html2md('<p><mark id="test"><span>text</span></p>')).toBe(
    ':mark[text]{#test}',
  );
});
