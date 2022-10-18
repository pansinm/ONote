import { EventEmitter } from 'events';
import type {
  MainEventPayload,
  PreviewerEventPayload,
} from '/@/rpc/EventPayload';

interface PreviewerService {
  on<T extends keyof MainEventPayload>(
    eventName: T,
    callback: (payload: MainEventPayload[T]) => void,
  ): this;
  off<T extends keyof MainEventPayload>(
    eventName: T,
    callback: (payload: MainEventPayload[T]) => void,
  ): this;
}

class PreviewerService extends EventEmitter {
  constructor() {
    super();
    window.addEventListener('message', (e) => {
      const { source, target, eventName, payload } = e.data || {};
      if (source === 'main' && target === 'previewer') {
        this.emit(eventName, payload);
      }
    });
  }

  send<T extends keyof PreviewerEventPayload>(
    eventName: T,
    payload: PreviewerEventPayload[T],
  ) {
    const message = {
      source: 'previewer',
      target: 'main',
      eventName,
      payload,
    };
    // iframe 内直接 post，独立窗口通过 preload 转发
    window.parent.postMessage(message);
  }
}

export default new PreviewerService();
