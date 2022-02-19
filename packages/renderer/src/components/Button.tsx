import classNames from 'classnames';
import type { CSSProperties, FunctionComponent } from 'react';
import React from 'react';
import styles from './Button.module.scss';

interface ButtonProps {
  style?: CSSProperties;
  color?: 'primary' | 'secondary';
  shape?: 'normal' | 'rectangle' | 'round';
  className?: string;
  onClick?: () => void;
}

const Button: FunctionComponent<ButtonProps> = ({
  style,
  className,
  color,
  children,
  shape,
  onClick,
}) => {
  const borderRadiusMap = {
    normal: 6,
    rectangle: 0,
    round: 100,
  };
  return (
    <button
      style={{ borderRadius: borderRadiusMap[shape!], ...style }}
      className={classNames(
        styles.Button,
        { [styles[color!]]: color },
        className,
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

Button.defaultProps = {
  color: 'primary',
  shape: 'normal',
};

export default Button;
