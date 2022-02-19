import React from 'react';
import type { LinkReference } from 'mdast';
import { renderChildren } from './render';
import { resolveUri } from './util/uri';

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
      className={`line-end-${node.position?.end.line} line-start-${node.position?.start.line}`}
      href={resolveUri(def.url, ctx)}
      title={def.title}
    >
      {renderChildren(node, ctx)}
    </a>
  );
}
