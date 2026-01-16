/**
 * 为文本内容添加行号前缀
 * @param content - 原始文本内容
 * @returns 带行号的文本内容，格式为 "1: content"
 */
export function addLineNumbers(content: string): string {
  if (!content) {
    return content;
  }

  return content
    .split('\n')
    .map((line, index) => `${index + 1}: ${line}`.trimEnd())
    .join('\n');
}
