import type { Text } from 'mdast';
import React from 'react';
import { useRef } from 'react';
import { parseText } from './util/dom';
import { createLineClass } from './util/position';
import * as Emoji from 'node-emoji';
import classNames from 'classnames';
import type { ICtx } from '../types';

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

function MdText({ node, ctx }: { node: Text; ctx: ICtx }) {
  const ref = useRef<HTMLSpanElement>(null);
  const nodeParts = parseText(
    String(node.value).replace(/[ \t]*(\r?\n|\r)[ \t]*/g, '$1'),
  );

  return (
    <span
      ref={ref}
      className={classNames(createLineClass(node.position), 'markdown-text')}
    >
      {nodeParts.map((nodePart, index) => renderNodePart(nodePart))}
    </span>
  );
}

export default function text(node: Text, ctx: any) {
  return <MdText node={node} ctx={ctx} />;
}
