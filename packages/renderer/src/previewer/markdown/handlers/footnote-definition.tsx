import type { FootnoteDefinition } from 'mdast';
import React from 'react';
import { renderChildren } from './render';

// 在render函数中已经将脚注放到ctx中了
export default function footnoteDefinition(node: FootnoteDefinition, ctx: any) {
  return <li id={`fn-def-${node.identifier}`}>{renderChildren(node, ctx)}</li>;
}
