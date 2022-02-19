import { useCallback, useLayoutEffect, useState } from 'react';

function useDimensions() {
  const [node, setNode] = useState<Element | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const ref = useCallback((node: Element | null) => {
    setNode(node);
  }, []);

  useLayoutEffect(() => {
    if (!node) {
      return;
    }
    const curNode = node;
    const resizeObserver = new ResizeObserver(() => {
      const rect = curNode.getBoundingClientRect();
      setRect(rect);
    });
    resizeObserver.observe(curNode);
    return () => {
      resizeObserver.unobserve(curNode);
    };
  }, [node]);
  return [ref, rect] as const;
}

export default useDimensions;