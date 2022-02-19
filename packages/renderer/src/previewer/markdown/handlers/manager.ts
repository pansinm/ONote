import type { Handlers } from './interface';
import handlers from './index';

class HandlersManager {
  handlers: Handlers = {...handlers};
  getHandlers() {
    return this.handlers;
  }

  setHandlers(handlers: Handlers) {
    this.handlers = handlers;
  }
}

export default new HandlersManager();
