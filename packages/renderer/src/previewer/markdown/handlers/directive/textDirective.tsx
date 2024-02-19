import type { Node, Text } from 'mdast';
import React from 'react';
import { DefaultDirective, parseDirectiveProps } from './directive';
import _ from 'lodash';
import type { ICtx } from '../../types';
import { getText } from '/@/common/markdown';
import ColorHash from 'color-hash';
import { createLineClass } from '../util/position';

const colorHash = new ColorHash();
export default function textDirective(
  node: { type: 'textDirective'; name: string; children: any[]; position: any },
  ctx: ICtx,
) {
  if (node.name === 'tag') {
    const text = getText(node);
    const { color = colorHash.hex(text) } = parseDirectiveProps(node);
    return (
      <span
        className={createLineClass(node.position)}
        style={{
          borderRadius: 6,
          padding: '2px 8px',
          fontSize: 12,
          background: `linear-gradient(rgba(255,255,255,.8),rgba(255,255,255,.8)),linear-gradient(${color}, ${color})`,
          color,
        }}
      >
        {ctx.renderChildren(node, ctx)}
      </span>
    );
  }
  return <DefaultDirective node={node} ctx={ctx} />;
}
