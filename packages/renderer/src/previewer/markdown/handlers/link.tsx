import React from 'react';
import type { Link } from 'mdast';
import { renderChildren } from './render';
import { resolveUri } from './util/uri';

export default function link(node: Link, ctx: any) {
  const url = resolveUri(node.url, ctx);
  return (
    <a
      className={`line-end-${node.position?.end.line} line-start-${node.position?.start.line}`}
      href={url}
      target="_blank"
      title={node.title || ''}
      rel="noreferrer"
    >
      {renderChildren(node, ctx)}
    </a>
  );
}
