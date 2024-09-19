import handlersManager from './handlers/manager';
import React from 'react';
import type { Node } from 'unist';
import type { ICtx } from './types';

export function render(node: Node, ctx: ICtx) {
  const handlers = handlersManager.getHandlers();
  const handler = handlers[node.type] || handlers.unknown;
  try {
    return handler(node, ctx);
  } catch (err) {
    return <p>{JSON.stringify(err, null, 2)}</p>;
  }
}

export function renderChildren(node: Node & { children?: any[] }, ctx: ICtx) {
  if (!node.children) {
    return null;
  }
  return (node.children as Node[]).map((n, index) => {
    const ele = render(n, ctx) as React.ReactNode;
    return <React.Fragment key={index}>{ele}</React.Fragment>;
  });
}
