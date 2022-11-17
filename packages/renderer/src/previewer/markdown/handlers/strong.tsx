import React from 'react';
import type { Strong } from 'mdast';
import { createLineClass } from './util/position';

export default function paragraph(node: Strong, ctx: any) {
  return (
    <strong className={createLineClass(node.position)}>
      {ctx.renderChildren(node, ctx)}
    </strong>
  );
}
