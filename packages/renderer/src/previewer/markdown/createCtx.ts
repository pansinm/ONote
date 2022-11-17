import type { Root, Content, Parent } from 'mdast';
import { definitions } from 'mdast-util-definitions';
import { visit } from 'unist-util-visit';
import handlersManager from './handlers/manager';
import React from 'react';
import type { Node } from 'unist';
import type { ICtx } from './types';

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

function render(node: Node, ctx: any) {
  const handlers = handlersManager.getHandlers();
  const handler = handlers[node.type] || handlers.unknown;
  return handler(node, ctx);
}

function renderChildren(node: Node & { children?: any[] }, ctx: ICtx) {
  if (!node.children) {
    return null;
  }
  return (node.children as Node[]).map((n, index) => {
    const node = ctx.render(n, ctx);
    if ((node as any)?.props?.key) {
      return React.cloneElement(node as React.ReactElement, { key: index });
    }
    return node;
  });
}

export const CONTINUE = Symbol('CONTINUE');

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

  const ctx = {
    render,
    renderChildren,
    definition: definitions(ast),
    footnoteById,
    footnoteOrder: [],
    fileUri: fileUri,
    rootDirUri: rootDirUri,
    continue: () => CONTINUE,
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

  return ctx;
}

export default createCtx;
