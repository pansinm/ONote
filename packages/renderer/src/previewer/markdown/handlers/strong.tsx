import React from 'react';
import type { Strong } from 'mdast';
import { renderChildren } from './render';

export default function paragraph(node: Strong, ctx: any) {
  return (
    <strong className={`line-end-${node.position?.end.line} line-start-${node.position?.start.line}`}>
      {renderChildren(node, ctx)}
    </strong>
  );
}
