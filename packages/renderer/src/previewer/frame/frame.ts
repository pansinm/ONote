import type React from 'react';
import { CONTINUE } from '../markdown/createCtx';
import * as handlersManager from '../markdown/handlers/manager';

type Renderer = {
  [key: string]: (node: any, ctx: any) => React.ReactNode | symbol;
};

export function registerMarkdownRenderer(renderer: Renderer) {
  Object.keys(renderer).forEach((key) => {
    const handlers = handlersManager.getHandlers();
    const prev = handlers[key];
    const render = renderer[key];
    handlers[key] = (node, ctx) => {
      const res = render(node, ctx);
      if (res === CONTINUE) {
        return prev(node, ctx);
      }
      return res;
    };
  });
}
