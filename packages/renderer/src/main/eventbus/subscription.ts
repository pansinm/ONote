import type { IDisposable } from 'monaco-editor';
import eventbus from './eventbus';

class Subscription {
  subscribe(event: string, callback: (...args: any[]) => void): IDisposable {
    eventbus.on(event, callback);
    return {
      dispose: () => {
        eventbus.off(event, callback);
      },
    };
  }
}

export const subscription = new Subscription();
