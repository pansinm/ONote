import classNames from 'classnames';
import type { FC } from 'react';
import React from 'react';
import styles from './Input.module.scss';

type InputProps = {
  value?: string;
  defaultValue?: string;
  className?: string;
  autoFocus?: boolean;
  onChange?: (val: string) => void;
};

const Input: FC<InputProps> = (props) => {
  return (
    <input
      value={props.value}
      className={classNames(styles.Input, props.className)}
      autoFocus={props.autoFocus}
      onChange={(e) => props.onChange?.(e.target.value)}
    ></input>
  );
};

export default Input;
