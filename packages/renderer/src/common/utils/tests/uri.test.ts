import {
  fileType,
  isMarkdown,
  relative,
  resolveUri,
  toFileUri,
  toONoteUri,
  isEquals,
  getParentUri,
} from '../uri';

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

test('resolveUri', () => {
  expect(resolveUri('file:///a/b/', 'c.txt')).toBe('file:///a/b/c.txt');
});

test('toONoteUri', () => {
  expect(toONoteUri('file:///a/b')).toBe('onote:///a/b');
});

test('toFileUri', () => {
  expect(toFileUri('onote:///a/b')).toBe('file:///a/b');
});

test('isEquals', () => {
  expect(isEquals('file:///测试.md', 'file:///%E6%B5%8B%E8%AF%95.md')).toBe(
    true,
  );
  expect(isEquals('file:///E:/测试.md', 'file:///e:/测试.md')).toBe(true);
});

test('relative', () => {
  expect(relative('file:///e%3A/a/a.md', 'file:///e:/a/assets/b.txt')).toBe(
    'assets/b.txt',
  );
  expect(relative('file:///a/b.txt', 'file:///b/c.txt')).toBe('../b/c.txt');
});

test('getParentUri', () => {
  expect(getParentUri('file:///a/b.txt')).toBe('file:///a');
});
