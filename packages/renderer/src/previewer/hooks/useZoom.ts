import { useEffect } from 'react';

function zoomOut() {
  const zoom = +(document.body.style as any).zoom || 1;
  if (zoom) {
    (document.body.style as any).zoom = zoom + 0.1;
  }
}

function zoomIn() {
  const zoom = +(document.body.style as any).zoom || 1;
  if (zoom && zoom > 0.3) {
    (document.body.style as any).zoom = zoom - 0.1;
  }
}

function reset() {
  (document.body.style as any).zoom = 1;
}

function useZoom() {
  useEffect(() => {
    const handleZoom = (e: KeyboardEvent) => {
      if (e.ctrlKey && '+='.includes(e.key)) {
        e.stopPropagation();
        e.preventDefault();
        zoomOut();
        return;
      }
      if (e.ctrlKey && '-_'.includes(e.key)) {
        e.stopPropagation();
        e.preventDefault();
        zoomIn();
      }
      if (e.ctrlKey && '0'.includes(e.key)) {
        e.stopPropagation();
        e.preventDefault();
        reset();
      }
    };
    document.addEventListener('keydown', handleZoom);
    return () => {
      document.removeEventListener('keydown', handleZoom);
    };
  }, []);
}

export default useZoom;
