import React from 'react';
import type { InlineMath } from 'mdast-util-math';
import katex from 'katex';
import type { ICtx } from '../types';
import { createLineClass } from './util/position';

const inlineMath = (node: InlineMath, ctx: ICtx) => {
  let html = '';
  try {
    html = katex.renderToString(node.value);
  } catch (err) {
    html = (err as Error).message;
  }
  return (
    <span
      className={createLineClass(node.position)}
      dangerouslySetInnerHTML={{ __html: html }}
    ></span>
  );
};

export default inlineMath;
