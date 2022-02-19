import type { FC } from 'react';
import React from 'react';
import Icon from '/@/components/Icon';
import styles from './ListHeader.module.scss';

interface ListHeaderProps {
  onTextChange?: (text: string) => void;
  onNoteCreate?: () => void;
}

const ListHeader: FC<ListHeaderProps> = ({ onNoteCreate, onTextChange }) => {
  const s = '\uf52a';
  return (
    <div className={styles.ListHeader}>
      <input
        type="search"
        onChange={(e) => onTextChange?.(e.target.value)}
        placeholder={`${s} 搜索`}
      ></input>
      <Icon type="plus" onClick={onNoteCreate} />
    </div>
  );
};

export default ListHeader;
