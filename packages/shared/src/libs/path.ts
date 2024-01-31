/**
 * 解析文件路径
 * @param paths
 * @returns
 */
export function join(...paths: string[]): string {
  if (!paths.length) {
    return '.';
  }
  // 正则表达式用于替换多个斜杠或反斜杠为单个斜杠
  const sep = '/'; // 使用斜杠作为默认分隔符
  const replaceRegex = new RegExp(`\\${sep}{1,}`, 'g');
  // 将所有路径片段标准化，移除多余的斜杠，合并/../和./等
  const result = paths
    .map((path) =>
      path
        .split(sep)
        .filter((part) => part !== '.')
        .map((part) => (part === '' ? '/' : part)),
    )
    .flat()
    .reduce((acc, part) => {
      if (part === '..') {
        acc.pop();
      } else {
        acc.push(part);
      }
      return acc;
    }, [] as string[])
    .join(sep);
  // 替换多个连续的分隔符为单个分隔符
  return result.replace(replaceRegex, sep);
}
