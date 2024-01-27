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
  let href = resolveAssetUri(def.url, ctx);
  const isCurrentPage = def.url.startsWith('#');
  if (isCurrentPage) {
    href = def.url;
  }
  return (
    <a
      className={createLineClass(node.position)}
      target={isCurrentPage ? undefined : '_blank'}
      href={href}
      title={def.title || undefined}
      rel="noreferrer"
    >
      {ctx.renderChildren(node, ctx)}
    </a>
  );
}
