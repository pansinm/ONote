import type { MutableRefObject } from 'react';
import { useEffect, useState } from 'react';
import { getLogger } from '/@/shared/logger';

const logger = getLogger('SelectionToolbarConfig');

function closest(
  node: Node | null,
  indicator: (node: Node) => boolean,
): Node | null {
  if (!node) {
    return null;
  }
  if (indicator(node)) {
    return node;
  }
  if (!node.parentNode) {
    return null;
  }
  return closest(node.parentNode, indicator);
}

export function useSelectionToolbarConfig() {
  const [config, setConfig] = useState({
    shown: false,
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const reset = (event: MouseEvent) => {
      setConfig((config) => ({ ...config, shown: false }));
    };
    const setPos = (event: MouseEvent) => {
      const selection = window.getSelection();
      logger.debug('Selection changed', { selection: selection?.toString() });
      if (selection?.isCollapsed) {
        return;
      }
      const range = selection?.getRangeAt(0);
      const bottom = range?.getBoundingClientRect().bottom;
      // const bottom = ele.offsetTop + ele.offsetHeight;
      setConfig({
        shown: true,
        x: event.pageX,
        y: bottom ? bottom + window.scrollY : event.pageY,
      });
    };
    window.addEventListener('mousedown', reset);
    window.addEventListener('mouseup', setPos);
    return () => {
      window.removeEventListener('mousedown', reset);
      window.removeEventListener('mouseup', setPos);
    };
  }, []);
  return config;
}
