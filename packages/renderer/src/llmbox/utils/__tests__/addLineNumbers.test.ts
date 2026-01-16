import { addLineNumbers } from '../addLineNumbers';

describe('addLineNumbers', () => {
  it('should add line numbers to multi-line text', () => {
    expect(addLineNumbers('line1\nline2\nline3'))
      .toBe('1: line1\n2: line2\n3: line3');
  });

  it('should handle empty lines', () => {
    expect(addLineNumbers('line1\n\nline3'))
      .toBe('1: line1\n2:\n3: line3');
  });

  it('should handle single line', () => {
    expect(addLineNumbers('hello'))
      .toBe('1: hello');
  });

  it('should handle empty string', () => {
    expect(addLineNumbers('')).toBe('');
  });

  it('should handle trailing newline', () => {
    expect(addLineNumbers('line1\nline2\n'))
      .toBe('1: line1\n2: line2\n3:');
  });

  it('should handle null/undefined-like empty string', () => {
    expect(addLineNumbers('')).toBe('');
  });

  it('should preserve special characters', () => {
    expect(addLineNumbers('const x = 1;\nconsole.log(x);'))
      .toBe('1: const x = 1;\n2: console.log(x);');
  });

  it('should preserve Unicode characters', () => {
    expect(addLineNumbers('你好世界\nHello World'))
      .toBe('1: 你好世界\n2: Hello World');
  });

  it('should handle code blocks', () => {
    const code = '```typescript\nfunction hello() {\n  return "world";\n}\n```';
    const expected = '1: ```typescript\n2: function hello() {\n3:   return "world";\n4: }\n5: ```';
    expect(addLineNumbers(code)).toBe(expected);
  });

  it('should handle large file', () => {
    const lines = Array.from({ length: 100 }, (_, i) => `line ${i + 1}`);
    const content = lines.join('\n');
    const result = addLineNumbers(content);

    expect(result.split('\n')[0]).toBe('1: line 1');
    expect(result.split('\n')[99]).toBe('100: line 100');
  });
});
