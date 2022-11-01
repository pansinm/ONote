import { fileType, isMarkdown } from '../uri';

test('fileType', () => {
  expect(fileType('file:///abc/abc.md')).toBe('markdown');
  expect(fileType('file:///abc/.gitignore')).toBe('plaintext');
  expect(fileType('file:///abc/x.xxxx')).toBe('unknown');
});

test('isMarkdown', () => {
  expect(isMarkdown('file:///x/abc.md')).toBe(true);
  expect(isMarkdown('file:///x/abc.mdx')).toBe(true);
  expect(isMarkdown('file:///x/abc.ss')).toBe(false);
  expect(isMarkdown('')).toBe(false);
});
