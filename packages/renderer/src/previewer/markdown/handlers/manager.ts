import type { Handlers } from './interface';
import handlers from './index';

export function getHandlers(): Handlers {
  return handlers;
}

export function setHandlers(newHandlers: Handlers): void {
  Object.assign(handlers, newHandlers);
}
