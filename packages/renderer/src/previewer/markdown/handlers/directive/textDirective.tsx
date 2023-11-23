import type { Text } from 'mdast';
import React from 'react';
import { DefaultDirective } from './directive';

export default function textDirective(node: Text, ctx: any) {
  return <DefaultDirective node={node} ctx={ctx} />;
}
