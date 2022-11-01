import React from 'react';
import type { ImageReference } from 'mdast';
import { resolveAssetUri } from './util/uri';
import { createLineClass } from './util/position';

export default function imageReference(node: ImageReference, ctx: any) {
  const def = ctx.definition(node.identifier);

  // 没有在definitions中，回退回文本
  if (!def) {
    return `![${node.label || node.identifier}]`;
  }

  return (
    <img
      className={createLineClass(node.position)}
      src={resolveAssetUri(def.url, ctx)}
      alt={node.alt || undefined}
      title={def.title}
    />
  );
}
