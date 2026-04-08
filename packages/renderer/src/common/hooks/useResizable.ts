import { useState, useEffect, useCallback } from 'react';
import { updateWidth, RESIZE_CONFIG, saveWidths } from '/@/common/constants/resize';

export type DragType = 'editor-preview' | 'llmbox' | 'sidebar' | 'file-list';

export interface DragState {
  isDragging: boolean;
  type: DragType | null;
  startX: number;
  currentX: number;
}

export interface ShrinkNeighborConfig {
  cssVar: string;
  min: number;
  max: number;
  unit: 'px' | '%';
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

  const [shrinkConfig, setShrinkConfig] = useState<ShrinkNeighborConfig | null>(null);

  const startDrag = useCallback((type: DragType, startX: number, shrinkNeighbor?: ShrinkNeighborConfig) => {
    setDragState({
      isDragging: true,
      type,
      startX,
      currentX: startX,
    });
    if (shrinkNeighbor) {
      setShrinkConfig(shrinkNeighbor);
    }
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
        'llmbox': RESIZE_CONFIG.llmbox,
        'sidebar': RESIZE_CONFIG.sidebar,
        'file-list': RESIZE_CONFIG.fileList,
      }[dragState.type];

      if (config) {
        const referenceWidth = containerRef.current?.offsetWidth;

        updateWidth(
          config.cssVar,
          delta,
          config.min,
          config.max,
          config.unit,
          dragState.type === 'llmbox',
          referenceWidth,
        );

        if (dragState.type === 'llmbox' && shrinkConfig) {
          // llmbox 变大 → neighbor 缩小，方向相同（不取反）
          updateWidth(
            shrinkConfig.cssVar,
            delta,
            shrinkConfig.min,
            shrinkConfig.max,
            shrinkConfig.unit,
            false,
            referenceWidth,
          );
        }
      }

      saveWidths();

      // 重置状态
      setDragState({
        isDragging: false,
        type: null,
        startX: 0,
        currentX: 0,
      });
      setShrinkConfig(null);

      // 回调
      onResizeEnd?.();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState.isDragging, dragState.startX, dragState.type, containerRef, onResizeEnd, shrinkConfig]);

  return { dragState, startDrag };
}
