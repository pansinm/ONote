import React from 'react';
import type { Strong } from 'mdast';
import { renderChildren } from './render';
import { createLineClass } from './util/position';

export default function paragraph(node: Strong, ctx: any) {
  return (
    <strong className={createLineClass(node.position)}>
      {renderChildren(node, ctx)}
    </strong>
  );
}
