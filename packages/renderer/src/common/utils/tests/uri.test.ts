import {
  fileType,
  isMarkdown,
  resolveUri,
  toFileUri,
  toONoteUri,
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
