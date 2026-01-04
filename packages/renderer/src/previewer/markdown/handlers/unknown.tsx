import React from 'react';
import type { Node } from 'unist';
import { createLineClass } from './util/position';
import { getLogger } from 'shared/logger';

const logger = getLogger('UnknownNodeHandler');

export default function unknown(node: Node & { children?: any[] }, ctx: any) {
  logger.warn('Unknown node type', { node });
  if (node.children) {
    return (
      <div className={createLineClass(node.position)}>
        {ctx.renderChildren(node, ctx)}
      </div>
    );
  }
  return null;
}
