import React from 'react';
import type { Heading } from 'mdast';
import { stringify } from '../../../common/markdown';
import { createLineClass } from './util/position';

export default function heading(node: Heading, ctx: any) {
  // eslint-disable-next-line react/no-children-prop
  return React.createElement('h' + node.depth, {
    // ### abc  => abc
    id: encodeURIComponent(
      stringify(node)
        .trim()
        .slice(node.depth + 1),
    ),
    className: createLineClass(node.position),
    children: ctx.renderChildren(node, ctx),
  });
}
