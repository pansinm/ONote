import type React from 'react';
import handlersManager from '../markdown/handlers/manager';

type Renderer = {
  [key: string]: (node: any, ctx: any) => React.ReactNode;
};

const SKIP = Symbol('skip');

export function registerMarkdownRenderer(renderer: Renderer) {
  Object.keys(renderer).forEach((key) => {
    const handlers = handlersManager.getHandlers();
    const prev = handlers[key];
    const render = renderer[key];
    handlers[key] = (node, ctx) => {
      ctx.skip = () => SKIP;
      const res = render(node, ctx);
      if (res === SKIP) {
        return prev(node, ctx);
      }
      return res;
    };
    handlersManager.setHandlers(handlers);
  });
}
