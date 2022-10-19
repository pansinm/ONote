import type { EventEmitter } from 'events';
export function waitEvent<T extends EventEmitter>(
  emitter: T,
  eventName: Parameters<T['on']>['0'],
  filter?: (data: any) => boolean,
): Promise<any> {
  return new Promise((resolve, reject) => {
    const handleRendered = (data: any) => {
      if (!filter || filter(data)) {
        emitter.off(eventName, handleRendered);
        resolve(data);
        return;
      }
    };
    emitter.on(eventName, handleRendered);
  });
}
