import type { Root, Content, Parent } from 'mdast';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import emoji from 'remark-emoji';
import gfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import footnotes from 'remark-footnotes';
import type { ReactNode } from 'react';
import { definitions } from 'mdast-util-definitions';
import { visit } from 'unist-util-visit';
import { render as renderAst } from './handlers/render';
import handlersManager from './handlers/manager';

const parser = unified()
  .use(remarkParse)
  .use(remarkFrontmatter, ['yaml', 'toml'])
  .use(footnotes, { inlineNotes: true })
  .use(gfm);

const transformToEmoji = (emoji as any)({
  emoticon: true,
  padSpaceAfter: true,
});
/**
 * 解析Markdown，定义成异步，也许以后有更好的渲染方式
 * @param markdown
 * @returns
 */
export function parse(markdown: string) {
  const ast = parser.parse(markdown) as Root;
  transformToEmoji(ast);
  return ast;
}

const findParentNode = (parent: Parent, node: Content): Parent | null => {
  if (parent?.children?.includes(node)) {
    return parent;
  }
  const child = parent?.children?.find((child) =>
    findParentNode(child as Parent, node),
  );
  if (child) {
    return child as Parent;
  }
  return null;
};

export function render(fileUri: string, ast: Root): ReactNode {
  const footnoteById: { [id: string]: any } = {};

  const ctx = {
    definition: definitions(ast),
    footnoteById,
    footnoteOrder: [],
    handlers: handlersManager.getHandlers(),
    fileUri: fileUri,
    getRootNode: () => ast,
    getParentNode: (node: Node) =>
      findParentNode(ast, node as unknown as Content),
  };

  visit(ast, 'footnoteDefinition', (def) => {
    const id = String(def.identifier).toUpperCase();

    // Mimick CM behavior of link definitions.
    // See: <https://github.com/syntax-tree/mdast-util-definitions/blob/8290999/index.js#L26>.
    if (!{}.hasOwnProperty.call(footnoteById, id)) {
      footnoteById[id] = def;
    }
  });

  return renderAst(ast, ctx);
}
