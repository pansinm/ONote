import React from 'react';
import ReactDOM from 'react-dom';

export function Drawer({
  isOpen,
  children,
}: {
  isOpen: boolean;
  children: React.ReactElement;
}) {
  return ReactDOM.createPortal(
    <div
      style={{
        position: 'fixed',
        height: '100%',
        width: '200px',
        background: '#fff',
        transition: 'right 0.4s',
        right: isOpen ? 0 : '-100%',
        top: 0,
        bottom: 0,
        zIndex: 100,
      }}
    >
      {children}
    </div>,
    document.body,
  );
}
