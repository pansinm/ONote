import React from 'react';
import type { Node } from 'unist';
import { renderChildren } from './render';
import { createLineClass } from './util/position';

export default function emphasis(node: Node, ctx: any) {
  return (
    <em className={createLineClass(node.position)}>
      {renderChildren(node, ctx)}
    </em>
  );
}
