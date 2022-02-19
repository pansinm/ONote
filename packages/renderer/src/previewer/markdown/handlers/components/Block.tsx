/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import React, { forwardRef } from 'react';
import './Block.scss';

export interface BlockProps {
  children: React.ReactChild;
  icons?: React.ReactNode;
  className?: string;
}
 const Block = forwardRef<HTMLDivElement, BlockProps>((props, ref) => {
  return (
    <div ref={ref} className={`wemark-block ${props.className || ''}`}>
      <div className="wemark-toolbar">{props.icons}</div>
      <div>{props.children}</div>
    </div>
  );
});

export default Block;
