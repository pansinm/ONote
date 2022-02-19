import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import { toMdast } from 'hast-util-to-mdast';
import { gfmToMarkdown } from 'mdast-util-gfm';
import { toMarkdown } from 'mdast-util-to-markdown';
import type { Content, Root } from 'mdast';
import remarkParse from 'remark-parse';
import gfm from 'remark-gfm';
import footnotes from 'remark-footnotes';
import mainRpcClient from '../rpc/mainRpcClient';
// import type {  } from 'hast-util-to-mdast';

export async function parse(markdown: string) {
  const ast = unified()
    .use(remarkParse)
    .use(footnotes, { inlineNotes: true })
    .use(gfm)
    .parse(markdown) as Root;
  return ast;
}

export function stringify(mdast: Root | Content) {
  const md = toMarkdown(mdast, {
    extensions: [gfmToMarkdown()],
    listItemIndent: 'one',
    bullet: '-',
  });
  return md;
}

export function replaceNode(
  fileUri: string,
  node: Root | Content,
  after: Root | Content,
) {
  const { start, end } = node.position!;
  mainRpcClient.replaceText(
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
