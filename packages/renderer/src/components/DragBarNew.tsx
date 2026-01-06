import type { CSSProperties } from 'react';
import React, { useState } from 'react';
import { RESIZE_CONFIG } from '/@/common/constants/resize';

interface DragIndicatorProps {
  visible: boolean;
  x: number;
  height: string;
}

function DragIndicator({ visible, x, height }: DragIndicatorProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: x,
        width: RESIZE_CONFIG.dragIndicator.width,
        height,
        background: RESIZE_CONFIG.dragIndicator.color,
        pointerEvents: 'none',
        zIndex: RESIZE_CONFIG.dragIndicator.zIndex,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.1s',
      }}
    />
  );
}

interface DragHandleProps {
  type: 'editor-preview' | 'llmbox';
  left?: string;
  right?: string;
  onStartDrag: (type: 'editor-preview' | 'llmbox', startX: number) => void;
  onDoubleClick?: () => void;
}

function DragHandle({ type, left, right, onStartDrag, onDoubleClick }: DragHandleProps) {
  const [hovering, setHovering] = useState(false);

  return (
    <div
      style={{
        position: 'absolute',
        left,
        right,
        top: 0,
        bottom: 0,
        width: RESIZE_CONFIG.dragHandle.width,
        background: hovering
          ? RESIZE_CONFIG.dragHandle.hoverColor
          : RESIZE_CONFIG.dragHandle.defaultColor,
        cursor: 'ew-resize',
        zIndex: RESIZE_CONFIG.dragHandle.zIndex,
        transition: 'background 0.1s',
      }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onDoubleClick={onDoubleClick}
      onMouseDown={(e) => {
        e.preventDefault();
        onStartDrag(type, e.clientX);
      }}
    />
  );
}

export { DragIndicator, DragHandle };

