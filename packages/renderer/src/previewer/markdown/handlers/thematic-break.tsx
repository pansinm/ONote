import React from 'react';
import type { ThematicBreak } from 'mdast';
import { createLineClass } from './util/position';

export default function table(node: ThematicBreak, ctx: any) {
  return <hr className={createLineClass(node.position)} />;
}
