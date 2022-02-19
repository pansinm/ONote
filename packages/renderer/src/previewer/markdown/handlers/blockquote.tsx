import React from 'react';
import type { Node } from 'unist';
import { renderChildren } from './render';

export default function blockquote(node: Node, ctx: { [key: string]: any }) {
  return (
    <blockquote className={`line-end-${node.position?.end.line} line-start-${node.position?.start.line}`}>
      {renderChildren(node, ctx)}
    </blockquote>
  );
}
