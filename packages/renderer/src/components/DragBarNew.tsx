import type { CSSProperties } from 'react';
import React, { useState } from 'react';

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
        width: '2px',
        height,
        background: 'rgb(56, 147, 199)',
        pointerEvents: 'none',
        zIndex: 10000,
        opacity: visible ?1 : 0,
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
}

function DragHandle({ type, left, right, onStartDrag }: DragHandleProps) {
  const [hovering, setHovering] = useState(false);

  return (
    <div
      style={{
        position: 'absolute',
        left,
        right,
        top: 0,
        bottom: 0,
        width: '4px',
        background: hovering ? 'rgb(56, 147, 199)' : 'rgba(56, 147, 199, 0.2)',
        cursor: 'ew-resize',
        zIndex: 1000,
        transition: 'background 0.1s',
      }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onMouseDown={(e) => {
        e.preventDefault();
        onStartDrag(type, e.clientX);
      }}
    />
  );
}

export { DragIndicator, DragHandle };

