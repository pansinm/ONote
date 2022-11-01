import React from 'react';
import type { Node } from 'unist';
import { parse } from 'yaml';
import { JSONTableViewer } from '@sinm/json-table-viewer';
import { createLineClass } from './util/position';

export default function yaml(node: Node & { value: string }, ctx: any) {
  let data: any = {};
  try {
    data = parse(node.value);
  } catch (err) {
    const { stack, message } = err as Error;
    data = { message, stack };
  }
  return (
    <div className={createLineClass(node.position)}>
      <JSONTableViewer json={data} />
    </div>
  );
}
