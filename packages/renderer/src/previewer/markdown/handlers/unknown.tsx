import React from 'react';
import type { Node } from 'unist';
import { createLineClass } from './util/position';

export default function unknown(node: Node & { children?: any[] }, ctx: any) {
  console.error('未知节点', node);
  if (node.children) {
    return (
      <div className={createLineClass(node.position)}>
        {ctx.renderChildren(node, ctx)}
      </div>
    );
  }
  return null;
}
