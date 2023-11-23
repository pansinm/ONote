import type { Node } from 'unist';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import gfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import footnotes from 'remark-footnotes';
import remarkEmoji from './remark-emoji';
import remarkDirective from 'remark-directive';
import remarkMath from 'remark-math';
import type { Root } from 'mdast';

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
