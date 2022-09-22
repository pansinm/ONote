import classNames from 'classnames';
import type { FC } from 'react';
import React from 'react';
import styles from './Input.module.scss';

type InputProps = {
  type?: React.HTMLInputTypeAttribute;
  name?: string;
  value?: string;
  disabled?: boolean;
  defaultValue?: string;
  className?: string;
  autoFocus?: boolean;
  placeholder?: string;
  onChange?: (val: string) => void;
  onEnter?(): void;
};

const Input: FC<InputProps> = (props) => {
  return (
    <input
      type={props.type || 'text'}
      disabled={props.disabled}
      name={props.name}
      placeholder={props.placeholder}
      value={props.value}
      className={classNames(styles.Input, props.className)}
      autoFocus={props.autoFocus}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          props.onEnter?.();
        }
      }}
      onChange={(e) => props.onChange?.(e.target.value)}
    ></input>
  );
};

export default Input;
