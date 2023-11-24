import type { Root, Content, Parent, RootContent } from 'mdast';
import { definitions } from 'mdast-util-definitions';
import { visit } from 'unist-util-visit';
import type { Node } from 'unist';
import { parse as parseToml } from 'toml';
import { parse as parseYaml } from 'yaml';
import { render, renderChildren } from './utils';

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

export const CONTINUE = Symbol('CONTINUE');

type FrontMatter = Node & { value: string };

function findFrontmatterNode(parent: {
  children: Node[];
  type: string;
}): FrontMatter | undefined {
  for (const child of parent.children) {
    if (['toml', 'yaml'].includes(child.type)) {
      return child as FrontMatter;
    }
    if ((child as any).children) {
      const found = findFrontmatterNode(child as any);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
}

function parseFrontMatter(node?: FrontMatter) {
  if (!node) {
    return {};
  }
  const parseMap: Record<string, typeof parseToml> = {
    toml: parseToml,
    yaml: parseYaml,
  };
  const parse = parseMap[node.type];
  let data = {};
  try {
    data = parse(node.value);
  } catch (err) {
    // ignore
  }
  return {
    data,
    node,
  };
}

function createCtx({
  fileUri,
  ast,
  rootDirUri,
}: {
  fileUri: string;
  ast: Root;
  rootDirUri: string;
}) {
  const footnoteById: { [id: string]: any } = {};
  const frontmatterNode = findFrontmatterNode(ast);
  const ctx = {
    render,
    renderChildren,
    frontmatter: parseFrontMatter(frontmatterNode),
    definition: definitions(ast),
    footnoteById,
    footnoteOrder: [],
    fileUri: fileUri,
    rootDirUri: rootDirUri,
    continue: () => CONTINUE,
    getRootNode: () => ast,
    getParentNode: (node: Node) =>
      findParentNode(ast, node as unknown as RootContent),
  };

  visit(ast, 'footnoteDefinition', (def) => {
    const id = String(def.identifier).toUpperCase();

    // Mimick CM behavior of link definitions.
    // See: <https://github.com/syntax-tree/mdast-util-definitions/blob/8290999/index.js#L26>.
    if (!{}.hasOwnProperty.call(footnoteById, id)) {
      footnoteById[id] = def;
    }
  });

  return ctx;
}

export default createCtx;
