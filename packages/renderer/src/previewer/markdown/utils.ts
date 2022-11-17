import type { Root } from 'mdast';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import gfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import footnotes from 'remark-footnotes';
import type { ReactNode } from 'react';
import remarkEmoji from './parser/remark-emoji';
import createCtx from './createCtx';

const parser = unified()
  .use(remarkParse)
  .use(remarkFrontmatter, ['yaml', 'toml'])
  .use(remarkEmoji)
  .use(footnotes, { inlineNotes: true })
  .use(gfm);

/**
 * 解析Markdown，定义成异步，也许以后有更好的渲染方式
 * @param markdown
 * @returns
 */
export function parse(markdown: string) {
  const ast = parser.parse(markdown) as Root;
  // transformToEmoji(ast);
  return ast;
}
export function render(
  fileUri: string,
  ast: Root,
  rootDirUri: string,
): ReactNode {
  const ctx = createCtx({ fileUri, ast, rootDirUri });
  return ctx.render(ast, ctx);
}
