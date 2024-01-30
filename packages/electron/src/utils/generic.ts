import type EventEmitter from 'events';

export type ValueOf<T> = T[keyof T];

export type GetListenerType<T extends EventTarget | EventEmitter> = T extends {
  on: EventEmitter['on'];
}
  ? Parameters<T['on']>
  : T extends { addEventListener: EventTarget['addEventListener'] }
    ? Parameters<T['addEventListener']>
    : never;
