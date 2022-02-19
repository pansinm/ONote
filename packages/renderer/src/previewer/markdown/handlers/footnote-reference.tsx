import type { FootnoteReference } from 'mdast';
import React from 'react';

export default function footnoteReference(
  node: FootnoteReference,
  ctx: any,
) {
  const footnoteOrder = ctx.footnoteOrder;
  const identifier = String(node.identifier);

  if (footnoteOrder.indexOf(identifier) === -1) {
    footnoteOrder.push(identifier);
  }

  return (
    <sup
      id={`fn-ref-${identifier}`}
      className={`line-end-${node.position?.end.line} line-start-${node.position?.start.line}`}
    >
      <a href={'#fn-def-' + identifier} className="footnote-ref">
        {ctx.footnoteOrder.indexOf(identifier) + 1}
      </a>
    </sup>
  );
}
