import React from 'react';
import type { InlineCode } from 'mdast';
import { createLineClass } from './util/position';

function isColor(text: string) {
  return /^(#[0-9A-F]{3}|#[0-9A-F]{6}|rgba?\([ ,0-9]+?\)|hsl\([ 0-9%]\))$/i.test(
    text,
  );
}

function ColorDot({ color }: { color: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        background: color,
        border: 0,
        borderRadius: 10,
        width: 10,
        height: 10,
        marginLeft: 5,
      }}
    ></span>
  );
}

export default function inlineCode(node: InlineCode, ctx: any) {
  return (
    <code className={createLineClass(node.position)}>
      {node.value}
      {isColor(node.value) ? <ColorDot color={node.value} /> : null}
    </code>
  );
}
