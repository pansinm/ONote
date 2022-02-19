import type { CSSProperties } from 'react';
import React from 'react';

interface FlexProps extends CSSProperties {
  className?: string;
}

const Flex: React.FC<FlexProps> = ({ className, children, ...style }) => {
  return (
    <div className={className} style={{ display: 'flex', ...style }}>
      {children}
    </div>
  );
};

export default Flex;
