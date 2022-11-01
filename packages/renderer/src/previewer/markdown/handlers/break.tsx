import React from 'react';
import type { Break } from 'mdast';
import { createLineClass } from './util/position';

export default function br(node: Break, ctx: any) {
  return <br className={createLineClass(node.position)} />;
}
