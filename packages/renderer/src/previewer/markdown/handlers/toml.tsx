import React from 'react';
import type { Node } from 'unist';
import { parse } from 'toml';
import { JSONTableViewer } from '@sinm/json-table-viewer';

export default function toml(node: Node & { value: string }, ctx: any) {
  let data: any = {};
  try {
    data = parse(node.value);
  } catch (err) {
    const { stack, message } = err as Error;
    data = { message, stack };
  }
  return (
    <div
      className={`line-end-${node.position?.end.line} line-start-${node.position?.start.line}`}
    >
      <JSONTableViewer json={data} />
    </div>
  );
}
