import type { CSSProperties, FC } from 'react';
import React from 'react';
import Icon from './Icon';

interface CheckBoxProps {
  checked?: boolean;
  onClick?(): void;
  style?: CSSProperties;
  className?: string;
}

const Checkbox: FC<CheckBoxProps> = ({
  style,
  className,
  checked,
  onClick,
}) => {
  return (
    <Icon
      style={style}
      className={className}
      type={checked ? 'check-circle' : 'circle'}
      onClick={onClick}
    ></Icon>
  );
};

export default Checkbox;
