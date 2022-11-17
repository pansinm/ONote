import React from 'react';
import type { LinkReference } from 'mdast';
import { resolveAssetUri } from './util/uri';
import { createLineClass } from './util/position';

export default function linkReference(node: LinkReference, ctx: any) {
  const def = ctx.definition(node.identifier);
  if (!def) {
    const head = `[${node.label || node.identifier}]`;
    let tail: React.ReactNode = '';
    if (node.children.length) {
      tail = <>[{renderChildren(node, ctx)}]</>;
    }
    return (
      <>
        {head}
        {tail}
      </>
    );
  }
  return (
    <a
      className={createLineClass(node.position)}
      href={resolveAssetUri(def.url, ctx)}
      title={def.title}
    >
      {ctx.renderChildren(node, ctx)}
    </a>
  );
}
