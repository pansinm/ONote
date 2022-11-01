import React from 'react';
import type { InlineCode } from 'mdast';
import { createLineClass } from './util/position';

export default function inlineCode(node: InlineCode, ctx: any) {
  return <code className={createLineClass(node.position)}>{node.value}</code>;
}
