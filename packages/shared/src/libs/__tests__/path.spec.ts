import { join } from '../path';

describe('join', () => {
  test('joins two paths', () => {
    expect(join('folder', 'subfolder')).toBe('folder/subfolder');
  });

  test('joins multiple paths', () => {
    expect(join('folder', 'subfolder', 'file.txt')).toBe(
      'folder/subfolder/file.txt',
    );
  });

  test('handles ../', () => {
    expect(join('folder', '../subfolder')).toBe('subfolder');
  });

  test('handles ./', () => {
    expect(join('folder', './subfolder')).toBe('folder/subfolder');
  });

  test('removes extra slashes', () => {
    expect(join('folder/', '/subfolder/', '/file.txt')).toBe(
      'folder/subfolder/file.txt',
    );
  });

  test('handles empty paths', () => {
    expect(join('folder', '', 'subfolder')).toBe('folder/subfolder');
  });

  test('returns "." for empty arguments', () => {
    expect(join()).toBe('.');
  });

  test('returns "/" for single "/" argument', () => {
    expect(join('/')).toBe('/');
  });
});
