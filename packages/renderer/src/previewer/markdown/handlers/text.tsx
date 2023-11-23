import type { Text } from 'mdast';
import React, { useEffect } from 'react';
import { useRef } from 'react';
import { parseText } from './util/dom';
import { createLineClass } from './util/position';
import * as Emoji from 'node-emoji';

function renderNodePart(nodePart: { type: string; value: string }) {
  if (nodePart.type === 'emoji') {
    const emoji = Emoji.get(nodePart.value);
    if (emoji) {
      return <span className="emoji">{emoji}</span>;
    }
    return `:${nodePart.value}:`;
  }

  return nodePart.value;
}

function MdText({ node }: { node: Text }) {
  const nodes = parseText(
    String(node.value).replace(/[ \t]*(\r?\n|\r)[ \t]*/g, '$1'),
  );
  return (
    <span className={createLineClass(node.position)}>
      {nodes.map((nodePart, index) => renderNodePart(nodePart))}
    </span>
  );
}

export default function text(node: Text, ctx: any) {
  return <MdText node={node} />;
}
