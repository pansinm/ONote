import React from 'react';
import type { Node } from 'unist';
import { renderChildren } from './render';
import { createLineClass } from './util/position';

export default function blockquote(node: Node, ctx: { [key: string]: any }) {
  return (
    <blockquote className={createLineClass(node.position)}>
      {renderChildren(node, ctx)}
    </blockquote>
  );
}
