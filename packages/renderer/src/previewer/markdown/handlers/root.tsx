import React from 'react';
import type { Root } from 'mdast';
import { renderChildren } from './render';
import footnoteDefinition from './footnote-definition';

function renderFootDefinitions(ctx: any) {
  if (!ctx.footnoteOrder.length) {
    return null;
  }
  return (
    <section className="footnotes">
      <ol>
        {ctx.footnoteOrder.map((footnote: string) => {
          return footnoteDefinition(
            ctx.footnoteById[footnote.toUpperCase()],
            ctx,
          );
        })}
      </ol>
    </section>
  );
}

export default function table(node: Root, ctx: any) {
  return (
    <article
      className={`markdown-body line-end-${node.position?.end.line} line-start-${node.position?.start.line}`}
    >
      {renderChildren(node, ctx)}
      {renderFootDefinitions(ctx)}
    </article>
  );
}
