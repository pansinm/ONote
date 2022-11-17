import React from 'react';
import type { Node } from 'unist';
import { createLineClass } from './util/position';

export default function strikethrough(node: Node, ctx: any) {
  return (
    <del className={createLineClass(node.position)}>
      {ctx.renderChildren(node, ctx)}
    </del>
  );
}
