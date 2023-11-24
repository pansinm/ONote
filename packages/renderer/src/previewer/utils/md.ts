import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import { toMdast } from 'hast-util-to-mdast';
import type { Content, Node, Root } from 'mdast';
import editor from '../ipc/editor';
import { stringify } from '../markdown/parser';
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

export function html2md(html: string) {
  const hast = unified().use(rehypeParse).parse(html);
  const mdast = toMdast(hast as any, {
    handlers: {
      comment: (h, node) => {
        return h(node, 'text', '');
      },
    },
  });

  return stringify(mdast);
}
