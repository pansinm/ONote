import type { Node } from 'unist';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import gfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import footnotes from 'remark-footnotes';
import remarkDirective from 'remark-directive';
import remarkMath from 'remark-math';
import rehypeParse from 'rehype-parse';
import { toMdast } from 'hast-util-to-mdast';

import type { Parent, Root, RootContent } from 'mdast';

const parser = unified()
  .use(remarkParse)
  .use(remarkDirective)
  .use(remarkStringify, { listItemIndent: 'one', bullet: '-' })
  .use(remarkMath)
  .use(remarkFrontmatter, ['yaml', 'toml'])
  // .use(remarkEmoji)
  .use(footnotes, { inlineNotes: true })
  .use(gfm);

export const parse = (markdown: string) => {
  try {
    return parser.parse(markdown);
  } catch (err) {
    console.error('parse markdown error', err);
    throw err;
  }
};

export const stringify = (node: Node) => {
  return parser.stringify(node as Root).trim();
};

export const traverse = (
  parent: Parent,
  indicator: (node: RootContent | Parent) => void | boolean,
) => {
  const done = indicator(parent);
  if (done) {
    return;
  }
  if (parent.children) {
    parent.children.forEach((item) => traverse(item as Parent, indicator));
  }
};

export function html2Mdast(html: string) {
  const hast = unified().use(rehypeParse).parse(html);
  const mdast = toMdast(hast as any, {
    handlers: {
      comment: (h, node) => {
        return h(node, 'text', '');
      },
      mark: (h, node) => {
        console.log(h, node);
        return h(
          node,
          'textDirective',
          { attributes: node.properties, name: 'mark' },
          node.children?.map((child: any) => toMdast(child)),
        );
      },
    },
  });
  return mdast;
}

export function html2md(html: string) {
  const mdast = html2Mdast(html);
  return stringify(mdast);
}
