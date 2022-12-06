import React from 'react';
import type { Math } from 'mdast-util-math';
import katex from 'katex';
import type { ICtx } from '../types';
import { createLineClass } from './util/position';
import 'katex/dist/katex.css';
const math = (node: Math, ctx: ICtx) => {
  let html = '';
  try {
    html = katex.renderToString(node.value);
  } catch (err) {
    html = (err as Error).message;
  }
  return (
    <div
      className={createLineClass(node.position)}
      dangerouslySetInnerHTML={{ __html: html }}
    ></div>
  );
};

export default math;
