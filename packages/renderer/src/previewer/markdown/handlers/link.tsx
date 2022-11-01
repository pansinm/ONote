import React from 'react';
import type { Link } from 'mdast';
import { renderChildren } from './render';
import { resolveAssetUri } from './util/uri';
import { createLineClass } from './util/position';

export default function link(node: Link, ctx: any) {
  const url = resolveAssetUri(node.url, ctx);
  return (
    <a
      className={createLineClass(node.position)}
      href={url}
      target="_blank"
      title={node.title || ''}
      rel="noreferrer"
    >
      {renderChildren(node, ctx)}
    </a>
  );
}
