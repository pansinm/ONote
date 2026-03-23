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

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        if (e.deltaY > 0) {
          zoomIn();
        } else {
          zoomOut();
        }
      }
    };

    document.addEventListener('keydown', handleZoom);
    document.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      document.removeEventListener('keydown', handleZoom);
      document.removeEventListener('wheel', handleWheel);
    };
  }, []);
}

export default useZoom;
