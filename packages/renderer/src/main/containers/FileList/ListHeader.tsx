import type { FC } from 'react';
import React from 'react';
import Icon from '/@/components/Icon';
import styles from './ListHeader.module.scss';

interface ListHeaderProps {
  searchText?: string;
  onTextChange?: (text: string) => void;
  onNoteCreate?: () => void;
}

const SEARCH_ICON = '\uf52a';
const ListHeader: FC<ListHeaderProps> = ({
  searchText,
  onNoteCreate,
  onTextChange,
}) => {
  return (
    <div className={styles.ListHeader}>
      <input
        value={searchText}
        type="search"
        onChange={(e) => onTextChange?.(e.target.value)}
        placeholder={`${SEARCH_ICON} 搜索文件`}
      ></input>
      <Icon type="plus" onClick={onNoteCreate} />
    </div>
  );
};

export default ListHeader;
