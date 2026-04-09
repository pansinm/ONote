import { useState, useEffect, useCallback } from 'react';
import { updateWidth, RESIZE_CONFIG, saveWidths } from '/@/common/constants/resize';

export type DragType = 'editor-preview' | 'sidebar';

export interface DragState {
  isDragging: boolean;
  type: DragType | null;
  startX: number;
  currentX: number;
}

interface UseResizableOptions {
  containerRef: React.RefObject<HTMLDivElement>;
  onResizeEnd?: () => void;
}

/**
 * 自定义 Hook：处理拖拽调整大小逻辑
 */
export function useResizable({ containerRef, onResizeEnd }: UseResizableOptions) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    type: null,
    startX: 0,
    currentX: 0,
  });

  const startDrag = useCallback((type: DragType, startX: number) => {
    setDragState({
      isDragging: true,
      type,
      startX,
      currentX: startX,
    });
  }, []);

  // 处理鼠标移动
  useEffect(() => {
    if (!dragState.isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const relativeX = e.clientX - containerRect.left;
      setDragState((prev) => ({ ...prev, currentX: relativeX }));
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!dragState.isDragging || !containerRef.current) return;

      const delta = e.clientX - dragState.startX;

      if (!dragState.type) return;

      const config = {
        'editor-preview': RESIZE_CONFIG.editor,
        'sidebar': RESIZE_CONFIG.sidebar,
      }[dragState.type];

      if (config) {
        const referenceWidth = containerRef.current?.offsetWidth;

        updateWidth(
          config.cssVar,
          delta,
          config.min,
          config.max,
          config.unit,
          referenceWidth,
        );
      }

      saveWidths();

      // 重置状态
      setDragState({
        isDragging: false,
        type: null,
        startX: 0,
        currentX: 0,
      });

      // 回调
      onResizeEnd?.();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState.isDragging, dragState.startX, dragState.type, containerRef, onResizeEnd]);

  return { dragState, startDrag };
}
