import { useEffect, useState } from 'react';

export function useSelectionToolbarConfig() {
  const [config, setConfig] = useState({
    shown: false,
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const reset = () => {
      setConfig({ shown: false, x: 0, y: 0 });
    };
    const setPos = (event: MouseEvent) => {
      const selection = window.getSelection();
      console.log(selection);
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
  });
  return config;
}
