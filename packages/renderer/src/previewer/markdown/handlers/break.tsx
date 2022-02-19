import React from 'react';
import type { Break } from 'mdast';

export default function br(node: Break, ctx: any) {
  return <br className={`line-end-${node.position?.end.line} line-start-${node.position?.start.line}`} />;
}
