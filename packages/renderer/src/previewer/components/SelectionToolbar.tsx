import React from 'react';
import { useSelectionToolbarConfig } from '../hooks/useSelectionToolbarConfig';

export function Toolbar() {
  const toolbarSetting = useSelectionToolbarConfig();

  return (
    <div
      style={{
        display: toolbarSetting.shown ? 'block' : 'none',
        top: toolbarSetting.y,
        left: toolbarSetting.x,
        position: 'absolute',
      }}
    >
      <span>x</span>
    </div>
  );
}
