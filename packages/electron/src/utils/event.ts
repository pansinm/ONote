/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { EventEmitter } from 'events';
import type { IDisposer } from './types';
import { TimeoutError } from './error';
import type { GetListenerType } from './generic';

export function subscribeEvent<
  T extends EventEmitter | EventTarget,
  K extends GetListenerType<T>,
>(emitter: T, event: K[0], callback: Extract<K[1], Function>): IDisposer {
  // for event target
  if (emitter instanceof EventTarget) {
    emitter.addEventListener(event as string, callback);
    return {
      dispose: () => emitter.removeEventListener(event as string, callback),
    };
  }
  // for event emitter
  emitter.addListener(event, callback);
  return {
    dispose: () => emitter.removeListener(event, callback),
  };
}

export type WaitEventOptions = {
  /**
   * 匹配函数，如果不传，事件一触发即返回
   * @param args
   * @returns
   */
  matcher?: (...args: any[]) => boolean;
  /**
   * 最大等待时间，如果不指定或值<=0，一直等待
   */
  maxWaitingTime?: number;
};

/**
 * 等待匹配的事件
 * @param emitter
 * @param event
 * @param options
 * @returns
 */
export function waitEvent<
  T extends EventTarget | EventEmitter,
  K extends GetListenerType<T>,
>(
  emitter: T,
  event: K[0],
  options: WaitEventOptions = {},
  // eslint-disable-next-line @typescript-eslint/ban-types
): Promise<Parameters<Extract<K[1], Function>>> {
  return new Promise((resolve, reject) => {
    const { matcher = () => true, maxWaitingTime = -1 } = options;
    let timeout: ReturnType<typeof setTimeout> | undefined = undefined;
    const disposer = subscribeEvent(emitter, event, ((...args: unknown[]) => {
      if (matcher(...args)) {
        clearTimeout(timeout);
        disposer.dispose();
        resolve(args as Parameters<Extract<K[1], Function>>);
      }
    }) as Extract<K[1], Function>);

    if (maxWaitingTime > 0) {
      timeout = setTimeout(() => {
        disposer.dispose();
        reject(new TimeoutError('Wait Event Timeout', maxWaitingTime));
      }, maxWaitingTime);
    }
  });
}
