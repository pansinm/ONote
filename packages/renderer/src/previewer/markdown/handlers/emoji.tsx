import React from 'react';
import type { Node } from 'unist';
import * as Emoji from 'node-emoji';
import { renderChildren } from './render';

export default function emoji(node: Node & { name: string }, ctx: any) {
  return (
    <span
      className={`line-end-${node.position?.end.line} line-start-${node.position?.start.line} emoji`}
    >
      {Emoji.get(node.name)}
    </span>
  );
}
