import type { Node, Text } from 'mdast';
import React, { useEffect } from 'react';
import { useRef } from 'react';
import { parseText } from './util/dom';
import { createLineClass } from './util/position';
import * as Emoji from 'node-emoji';
import classNames from 'classnames';
import type { ICtx } from '../types';
import { replaceNode } from '../../utils/md';
import { useLatest } from 'react-use';
import BatchApply from '../../editor/BatchApply';

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

function extractReplaceNodes(
  textNodeParts: ReturnType<typeof parseText>,
  id: string,
  start = 0,
  end?: number,
) {
  let cursor = 0;
  let startText = '';
  let markedText = '';
  let endText = '';
  textNodeParts.forEach((part) => {
    const startSplitPoint = start - cursor;
    const endSplitPoint = typeof end === 'undefined' ? undefined : end - cursor;
    if (part.type === 'text') {
      if (startSplitPoint > 0) {
        startText += part.value.slice(0, startSplitPoint);
      }
      if (endSplitPoint === undefined || endSplitPoint > startSplitPoint) {
        markedText += part.value.slice(startSplitPoint, endSplitPoint);
      }
      if (endSplitPoint) {
        endText += part.value.slice(endSplitPoint);
      }
      cursor += part.value.length;
    }
    if (part.type === 'emoji') {
      if (startSplitPoint > 0) {
        startText += `:${part.value}:`;
      } else if (
        endSplitPoint === undefined ||
        endSplitPoint > startSplitPoint
      ) {
        markedText += `:${part.value}:`;
      } else {
        endText += `:${part.value}:`;
      }
      cursor += 1;
    }
  });

  const nodes: Node[] = [];
  if (startText) {
    nodes.push({
      type: 'text',
      value: startText,
    } as Text);
  }

  if (markedText)
    nodes.push({
      type: 'textDirective',
      children: [{ type: 'text', value: markedText }],
      name: 'mark',
      attributes: { id },
    } as Node);
  if (endText)
    nodes.push({
      type: 'text',
      value: endText,
    } as Node);
  return nodes as Text[];
}

function MdText({ node, ctx }: { node: Text; ctx: ICtx }) {
  const ref = useRef<HTMLSpanElement>(null);
  const nodeParts = parseText(
    String(node.value).replace(/[ \t]*(\r?\n|\r)[ \t]*/g, '$1'),
  );
  const nodePartsLatest = useLatest(nodeParts);
  const ctxLatest = useLatest(ctx);
  useEffect(() => {
    const batchApply = new BatchApply();
    const handleComment = (event: any) => {
      const { start, end, id } = event.detail;
      const edit = batchApply.createReplaceEdit(node, {
        type: 'paragraph',
        children: extractReplaceNodes(nodePartsLatest.current, id, start, end),
      });
      batchApply.applyLater(ctxLatest.current.fileUri, edit);
    };

    ref.current?.addEventListener('comment', handleComment);
    return () => {
      ref.current?.removeEventListener('comment', handleComment);
    };
  }, [node]);
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
