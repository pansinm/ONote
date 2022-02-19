import React from 'react';
import type { InlineCode } from 'mdast';

export default function inlineCode(node: InlineCode, ctx: any) {
  return <code className={`line-end-${node.position?.end.line} line-start-${node.position?.start.line}`}>{node.value}</code>;
}
