import { EventEmitter } from 'events';
import type {
  MainEventPayload,
  PreviewerEventPayload,
} from '/@/rpc/EventPayload';

interface PreviewerService {
  on<T extends keyof PreviewerEventPayload>(
    eventName: T,
    callback: (payload: PreviewerEventPayload[T]) => void,
  ): this;
  off<T extends keyof PreviewerEventPayload>(
    eventName: T,
    callback: (payload: PreviewerEventPayload[T]) => void,
  ): this;
}

class PreviewerService extends EventEmitter {
  constructor() {
    super();
    window.addEventListener('message', (e) => {
      const { source, target, eventName, payload } = e.data || {};
      if (source === 'previewer' && target === 'main') {
        this.emit(eventName, payload);
      }
    });
  }

  send<T extends keyof MainEventPayload>(
    eventName: T,
    payload: MainEventPayload[T],
  ) {
    const message = {
      source: 'main',
      target: 'previewer',
      eventName,
      payload,
    };
    const markdownPreviewer = (document as any)
      .markdownPreviewer as Window | null;
    if (markdownPreviewer) {
      markdownPreviewer.postMessage(message);
    } else {
      window.simmer.postMessageToPreviewerWindow(message);
    }
  }
}

export default new PreviewerService();
