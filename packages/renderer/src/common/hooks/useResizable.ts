import { useState, useEffect, useCallback } from 'react';
import { updateWidth, RESIZE_CONFIG, saveWidths } from '/@/common/constants/resize';

export interface DragState {
  isDragging: boolean;
  type: 'editor-preview' | 'llmbox' | null;
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

  // 开始拖拽
  const startDrag = useCallback((type: 'editor-preview' | 'llmbox', startX: number) => {
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

      const containerRect = containerRef.current.getBoundingClientRect();
      const delta = e.clientX - dragState.startX;
      const containerWidth = containerRect.width;

      // 更新宽度
      if (dragState.type === 'editor-preview') {
        updateWidth(
          RESIZE_CONFIG.editor.cssVar,
          delta,
          containerWidth,
          RESIZE_CONFIG.editor.minPercent,
          RESIZE_CONFIG.editor.maxPercent,
          false
        );
      } else if (dragState.type === 'llmbox') {
        updateWidth(
          RESIZE_CONFIG.llmbox.cssVar,
          delta,
          containerWidth,
          RESIZE_CONFIG.llmbox.minPercent,
          RESIZE_CONFIG.llmbox.maxPercent,
          true
        );
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
