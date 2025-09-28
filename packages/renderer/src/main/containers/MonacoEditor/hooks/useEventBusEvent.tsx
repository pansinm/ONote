import { useEffect } from 'react';
import { useLatest } from 'react-use';
import eventbus from '../../../eventbus/eventbus';

export function useEventBusEvent(
  name: string,
  callback: (...args: any[]) => void,
) {
  const latest = useLatest(callback);
  useEffect(() => {
    const handler = (...args: any) => latest.current(...args);
    eventbus.on(name, handler);
    return () => {
      eventbus.off(name, handler);
    };
  });
}
