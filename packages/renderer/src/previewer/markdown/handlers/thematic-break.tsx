import React from 'react';
import type { ThematicBreak } from 'mdast';

export default function table(node: ThematicBreak, ctx: any) {
  return <hr className={`line-end-${node.position?.end.line} line-start-${node.position?.start.line}`} />;
}
