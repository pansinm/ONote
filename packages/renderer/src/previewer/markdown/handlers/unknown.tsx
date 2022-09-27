import React from 'react';
import type { Node } from 'unist';
import { renderChildren } from './render';

export default function unknown(node: Node & { children?: any[] }, ctx: any) {
  console.error('未知节点', node);
  if (node.children) {
    return (
      <div
        className={`line-end-${node.position?.end.line} line-start-${node.position?.start.line}`}
      >
        {renderChildren(node, ctx)}
      </div>
    );
  }
  return null;
}
