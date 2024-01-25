import React from 'react';
import type { Heading } from 'mdast';
import { getText } from '../../../common/markdown';
import { createLineClass } from './util/position';

export default function heading(node: Heading, ctx: any) {
  // eslint-disable-next-line react/no-children-prop
  return React.createElement('h' + node.depth, {
    // ### abc  => abc
    id: encodeURIComponent(getText(node)),
    className: createLineClass(node.position),
    children: ctx.renderChildren(node, ctx),
  });
}
