import React from 'react';
import type { LinkReference } from 'mdast';
import { resolveAssetUri } from './util/uri';
import { createLineClass } from './util/position';
import type { ICtx } from '../types';

export default function linkReference(node: LinkReference, ctx: ICtx) {
  const def = ctx.definition(node.identifier);
  if (!def) {
    const head = `[${node.label || node.identifier}]`;
    let tail: React.ReactNode = '';
    if (node.children.length) {
      tail = <>[{ctx.renderChildren(node, ctx)}]</>;
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
      target="_blank"
      href={resolveAssetUri(def.url, ctx)}
      title={def.title || undefined}
      rel="noreferrer"
    >
      {ctx.renderChildren(node, ctx)}
    </a>
  );
}
