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

      const containerRect = containerRef.current.getBoundingClientRect();
      const delta = e.clientX - dragState.startX;
      const containerWidth = containerRect.width;

      // 更新宽度
      if (dragState.type === 'editor-preview') {
        updateWidth(
          RESIZE_CONFIG.editor.cssVar,
          delta,
          RESIZE_CONFIG.editor.min,
          RESIZE_CONFIG.editor.max,
          false,
        );
      } else if (dragState.type === 'llmbox') {
        updateWidth(
          RESIZE_CONFIG.llmbox.cssVar,
          delta,
          RESIZE_CONFIG.llmbox.min,
          RESIZE_CONFIG.llmbox.max,
          true,
        );
        if (shrinkConfig) {
          const neighborWidth = getComputedStyle(document.documentElement)
            .getPropertyValue(shrinkConfig.cssVar)
            .trim();
          const currentNeighborPixels = parseFloat(neighborWidth) || shrinkConfig.min;
          const newNeighborPixels = currentNeighborPixels - delta;
          const clampedNeighbor = Math.max(shrinkConfig.min, Math.min(shrinkConfig.max, newNeighborPixels));
          document.documentElement.style.setProperty(shrinkConfig.cssVar, `${clampedNeighbor}px`);
        }
      } else if (dragState.type === 'sidebar') {
        const root = document.documentElement;
        const sidebarEle = document.querySelector('.sidebar')!;
        const currentWidth = parseFloat(getComputedStyle(sidebarEle).width);
        const newWidth = Math.max(150, Math.min(500, currentWidth + delta));
        root.style.setProperty('--sidebar-width', `${newWidth}px`);
      } else if (dragState.type === 'file-list') {
        const root = document.documentElement;
        const fileListEle = document.querySelector('.file-list')!;
        const currentWidth = parseFloat(getComputedStyle(fileListEle).width);
        const newWidth = Math.max(150, Math.min(500, currentWidth + delta));
        root.style.setProperty('--file-list-width', `${newWidth}px`);
      }

      // 保存设置
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
