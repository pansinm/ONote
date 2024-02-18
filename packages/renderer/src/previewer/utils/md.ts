import type { Content, Root } from 'mdast';
import editor from '../ipc/editor';
import { stringify } from '/@/common/markdown';

export function replaceNode(
  fileUri: string,
  node: Root | Content,
  after: Root | Content,
) {
  const { start, end } = node.position!;

  const lines = stringify(after).trim().split('\n');
  const afterText = lines
    .map((line, index) =>
      index > 0 ? new Array(start.column - 1).fill(' ').join('') + line : line,
    )
    .join('\n');
  console.log(node, after);
  editor.insertText(
    fileUri,
    {
      startLineNumber: start.line,
      startColumn: start.column,
      endLineNumber: end.line,
      endColumn: end.column,
    },
    afterText,
  );
}
