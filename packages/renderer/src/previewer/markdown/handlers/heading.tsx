import React from 'react';
import type { Heading } from 'mdast';
import { renderChildren } from './render';
import { stringify } from '../../utils/md';

export default function heading(node: Heading, ctx: any) {
  // eslint-disable-next-line react/no-children-prop
  return React.createElement('h' + node.depth, {
    // ### abc  => abc
    id: encodeURIComponent(
      stringify(node)
        .trim()
        .slice(node.depth + 1),
    ),
    className: `line-end-${node.position?.end.line} line-start-${node.position?.start.line}`,
    children: renderChildren(node, ctx),
  });
}
