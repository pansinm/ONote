import { isEqual } from 'lodash';
import {
  fileType,
  isMarkdown,
  relative,
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

test('isEquals', () => {
  expect(isEqual('file:///测试.md', 'file:///%E6%B5%8B%E8%AF%95'));
  expect(isEqual('file:///E:/测试.md', 'file:///e:/测试.md'));
});

test('relative', () => {
  expect(relative('file:///a/b.txt', 'file:///b/c.txt')).toBe('../b/c.txt');
});
