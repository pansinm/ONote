import type { FootnoteDefinition } from 'mdast';
import React from 'react';

// 在render函数中已经将脚注放到ctx中了
export default function footnoteDefinition(node: FootnoteDefinition, ctx: any) {
  return (
    <li id={`fn-def-${node.identifier}`}>{ctx.renderChildren(node, ctx)}</li>
  );
}
