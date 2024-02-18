import type { Content, Root } from 'mdast';
import editor from '../ipc/editor';
import { stringify } from '/@/common/markdown';
// import type {  } from 'hast-util-to-mdast';

export function replaceNode(
  fileUri: string,
  node: Root | Content,
  after: Root | Content,
) {
  const { start, end } = node.position!;
  editor.insertText(
    fileUri,
    {
      startLineNumber: start.line,
      startColumn: start.column,
      endLineNumber: end.line,
      endColumn: end.column,
    },
    stringify(after).trim(),
  );
}
