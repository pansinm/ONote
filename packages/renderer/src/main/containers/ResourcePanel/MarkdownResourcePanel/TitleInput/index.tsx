import type { FC } from 'react';
import { useEffect } from 'react';
import React, { useRef, useState } from 'react';
import Icon from '/@/components/Icon';
import styles from './index.module.scss';

interface TitleInputProps {
  title: string;
  onChange?: (title: string) => void;
}

const TitleEditor: FC<TitleInputProps> = ({ title, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState(title);
  useEffect(() => {
    setText(title);
  }, [title]);

  return (
    <div className={styles.TitleInput}>
      <Icon type="pencil" color='#666' size={16} onClick={() => inputRef.current?.focus()} />
      <input
        ref={inputRef}
        value={text}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            inputRef.current?.blur();
            return;
          }
          
          if (e.key === 'Escape') {
            setText(title);
            inputRef.current?.blur();
          }
        }}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => onChange?.(text)}
      ></input>
    </div>
  );
};

export default TitleEditor;
