import type { CSSProperties } from 'react';
import React, { useState } from 'react';
import { RESIZE_CONFIG } from '/@/common/constants/resize';
import type { DragType } from '/@/common/hooks/useResizable';

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
  type: DragType;
  left?: string;
  right?: string;
  onStartDrag: (type: DragType, startX: number) => void;
  onDoubleClick?: () => void;
  /** 是否正在拖拽中（由父组件的 dragState 传入） */
  isDragging?: boolean;
}

function DragHandle({ type, left, right, onStartDrag, onDoubleClick, isDragging }: DragHandleProps) {
  const [hovering, setHovering] = useState(false);

  const lineColor = isDragging
    ? RESIZE_CONFIG.dragHandle.draggingColor
    : hovering
      ? RESIZE_CONFIG.dragHandle.hoverColor
      : RESIZE_CONFIG.dragHandle.defaultColor;

  const lineStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: RESIZE_CONFIG.dragHandle.lineWidth,
    background: lineColor,
    transition: 'background 0.15s ease',
    pointerEvents: 'none',
  };

  return (
    <div
      style={{
        position: 'absolute',
        left,
        right,
        top: 0,
        bottom: 0,
        width: RESIZE_CONFIG.dragHandle.hitAreaWidth,
        cursor: 'col-resize',
        zIndex: RESIZE_CONFIG.dragHandle.zIndex,
      }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onDoubleClick={onDoubleClick}
      onMouseDown={(e) => {
        e.preventDefault();
        onStartDrag(type, e.clientX);
      }}
    >
      <div style={lineStyle} />
    </div>
  );
}

export { DragIndicator, DragHandle };
