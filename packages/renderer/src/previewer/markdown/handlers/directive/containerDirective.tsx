import React from 'react';
import type { ICtx } from '../../types';
import { DefaultDirective, parseDirectiveProps } from './directive';

function DetailsDirective({ node, ctx }: { node: any; ctx: ICtx }) {
  const directiveLabels = node.children.filter(
    (child: any) => child.data?.directiveLabel,
  );
  const children = node.children.filter(
    (child: any) => !child.data?.directiveLabel,
  );
  return (
    <details {...parseDirectiveProps(node)}>
      {directiveLabels.length ? (
        <summary>
          {directiveLabels.map((child: any) => ctx.renderChildren(child, ctx))}
        </summary>
      ) : null}
      {children.map((child: any) => ctx.render(child, ctx))}
    </details>
  );
}

export default function containerDirective(node: any, ctx: any) {
  if (node.name === 'details') {
    return <DetailsDirective node={node} ctx={ctx} />;
  }
  return <DefaultDirective node={node} ctx={ctx} />;
}
