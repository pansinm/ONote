import type { CSSProperties } from 'react';
import React, { useRef, useState } from 'react';
import { DraggableCore as Draggable } from 'react-draggable';
import './DragBar.scss';

interface DragBarProps {
  onStop(delta: number): void;
  onStart?(): void;
  style?: CSSProperties;
}

function DragBar(props: DragBarProps) {
  const beforeX = useRef(0);

  const [x, setX] = useState(0);

  return (
    <Draggable
      // axis="x"
      handle=".resize-handle"
      // defaultPosition={{ x: 0, y: 0 }}
      // position={undefined}
      grid={[1, 1]}
      scale={1}
      onStart={(event, data) => {
        beforeX.current = data.lastX;
      }}
      onDrag={(_, data) => {
        setX(data.lastX - beforeX.current);
        props.onStart?.();
      }}
      onStop={(event, data) => {
        props.onStop(data.lastX - beforeX.current);
        setX(0);
      }}
    >
      <div
        className={`resize-handle ${x ? 'moving' : ''}`}
        style={{ ...props.style, transform: `translateX(${x}px)` }}
      ></div>
    </Draggable>
  );
}

export default DragBar;
