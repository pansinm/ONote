import type { Root, Content, Parent } from 'mdast';
import { definitions } from 'mdast-util-definitions';
import { visit } from 'unist-util-visit';
import handlersManager from './handlers/manager';
import React from 'react';
import type { Node } from 'unist';
import type { ICtx } from './types';

export function render(node: Node, ctx: ICtx) {
  const handlers = handlersManager.getHandlers();
  const handler = handlers[node.type] || handlers.unknown;
  return handler(node, ctx);
}

export function renderChildren(node: Node & { children?: any[] }, ctx: ICtx) {
  if (!node.children) {
    return null;
  }
  return (node.children as Node[]).map((n, index) => {
    const node = render(n, ctx);
    if ((node as any)?.props?.key) {
      return React.cloneElement(node as React.ReactElement, { key: index });
    }
    return node;
  });
}
