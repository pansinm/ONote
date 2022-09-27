import React from 'react';
import type { Node } from 'unist';
import unknown from './unknown';

export function render(node: Node, ctx: any) {
  const handler = ctx.handlers[node.type] || ctx.handlers.unknown || unknown;
  return handler(node, ctx);
}

export function renderChildren(node: Node & { children?: any[] }, ctx: any) {
  if (!node.children) {
    return null;
  }
  return (node.children as Node[]).map((n, index) => {
    const node = render(n, ctx);
    if (node && node.props && !node.props.key) {
      return React.cloneElement(node, { key: index });
    }
    return node;
  });
}
