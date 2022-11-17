import React from 'react';
import type { Node } from 'unist';
import { createLineClass } from './util/position';

export default function emphasis(node: Node, ctx: any) {
  return (
    <em className={createLineClass(node.position)}>
      {ctx.renderChildren(node, ctx)}
    </em>
  );
}
