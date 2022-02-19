import type { Footnote } from 'mdast';
import footnoteReference from './footnote-reference';

export default function footnote(node: Footnote, ctx: any) {
  const footnoteById = ctx.footnoteById;
  const footnoteOrder = ctx.footnoteOrder;
  let identifier: string | number = 1;

  while (identifier in footnoteById) {
    identifier += 1;
  }

  identifier = String(identifier);

  // No need to check if `identifier` exists in `footnoteOrder`, it’s guaranteed
  // to not exist because we just generated it.
  footnoteOrder.push(identifier);

  footnoteById[identifier] = {
    type: 'footnoteDefinition',
    identifier: identifier,
    children: [{ type: 'paragraph', children: node.children }],
    position: node.position,
  };

  return footnoteReference(
    {
      type: 'footnoteReference',
      identifier: identifier,
      position: node.position,
    },
    ctx,
  );
}
