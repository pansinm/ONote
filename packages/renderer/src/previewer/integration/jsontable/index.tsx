import React from 'react';
import type { Code } from 'mdast';
import frame from '../../frame';
import type { ICtx } from '../../markdown/types';
import { JSONTableViewer } from '@sinm/json-table-viewer';
frame.registerMarkdownRenderer({
  code: (node: Code, ctx: ICtx) => {
    if (node.lang === 'json' && node.meta === 'table') {
      try {
        const json = JSON.parse(node.value);
        return <JSONTableViewer json={json} />;
      } catch (err) {
        return ctx.continue();
      }
    }
    return ctx.continue();
  },
});
