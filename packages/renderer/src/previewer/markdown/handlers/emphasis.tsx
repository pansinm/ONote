import React from 'react';
import type { Node } from 'unist';
import { renderChildren } from './render';

export default function emphasis(node: Node, ctx: any) {
  return (
    <em className={`line-end-${node.position?.end.line} line-start-${node.position?.start.line}`}>
      {renderChildren(node, ctx)}
    </em>
  );
}
