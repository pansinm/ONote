import React from 'react';
import type { ImageReference } from 'mdast';
import { resolveAssetUri } from './util/uri';

export default function imageReference(node: ImageReference, ctx: any) {
  const def = ctx.definition(node.identifier);

  // 没有在definitions中，回退回文本
  if (!def) {
    return `![${node.label || node.identifier}]`;
  }

  return (
    <img
      className={`line-end-${node.position?.end.line} line-start-${node.position?.start.line}`}
      src={resolveAssetUri(def.url, ctx)}
      alt={node.alt}
      title={def.title}
    />
  );
}
