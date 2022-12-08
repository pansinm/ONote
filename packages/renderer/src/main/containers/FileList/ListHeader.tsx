import type { FC } from 'react';
import React from 'react';
import Icon from '/@/components/Icon';
import {
  TextHanging24Regular,
  TextHangingRegular,
} from '@fluentui/react-icons';
import { makeStyles, shorthands } from '@fluentui/react-components';

interface ListHeaderProps {
  searchText?: string;
  onTextChange?: (text: string) => void;
  onNoteCreate?: () => void;
  onPrefixIconClick(): void;
}

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...shorthands.padding('10px'),
  },
  prefix: {
    // marginRight: '5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    ':hover': {
      backgroundColor: 'rgba(0,0,0,0.05)',
      cursor: 'pointer',
    },
  },
  input: {
    height: '28px',
    ...shorthands.flex(1),
    ...shorthands.padding('5px', '10px'),
    ...shorthands.border('1px', 'solid', '#d3b17d'),
    minWidth: '50px',
    fontFamily: 'bootstrap-icons',
  },
  suffix: {
    width: '40px',
    ':hover': {
      backgroundColor: 'rgba(0,0,0,0.05)',
      cursor: 'pointer',
    },
  },
});

const SEARCH_ICON = '\uf52a';

const ListHeader: FC<ListHeaderProps> = ({
  searchText,
  onNoteCreate,
  onTextChange,
  onPrefixIconClick,
}) => {
  const styles = useStyles();
  return (
    <div className={styles.root}>
      <span className={styles.prefix}>
        <TextHangingRegular onClick={onPrefixIconClick} fontSize={22} />
      </span>
      <input
        className={styles.input}
        value={searchText}
        type="search"
        onChange={(e) => onTextChange?.(e.target.value)}
        placeholder={`${SEARCH_ICON} 搜索文件`}
      ></input>
      <Icon className={styles.suffix} type="plus" onClick={onNoteCreate} />
    </div>
  );
};

export default ListHeader;
