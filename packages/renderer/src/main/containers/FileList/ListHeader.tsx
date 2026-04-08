import type { FC } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '/@/components/Icon';
import {
  TextHangingRegular,
  DismissRegular,
} from '@fluentui/react-icons';
import { makeStyles, shorthands } from '@fluentui/react-components';
import type FileListStore from '../../stores/FileListStore';

type SorterType = FileListStore['sorter'];

const SORTER_I18N_KEY: Record<SorterType, string> = {
  'name-asc': 'sortNameAsc',
  'name-desc': 'sortNameDesc',
  'time-asc': 'sortTimeAsc',
  'time-desc': 'sortTimeDesc',
};

const SORTER_ICON: Record<SorterType, string> = {
  'name-asc': 'sort-alpha-down',
  'name-desc': 'sort-alpha-up',
  'time-asc': 'sort-down',
  'time-desc': 'sort-up',
};

interface ListHeaderProps {
  searchText?: string;
  onTextChange?: (text: string) => void;
  onNoteCreate?: () => void;
  onPrefixIconClick(): void;
  sorter?: SorterType;
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    ':hover': {
      backgroundColor: 'rgba(0,0,0,0.05)',
      cursor: 'pointer',
    },
  },
  inputWrap: {
    position: 'relative',
    ...shorthands.flex(1),
    minWidth: '50px',
  },
  input: {
    width: '100%',
    height: '28px',
    ...shorthands.padding('5px', '28px', '5px', '10px'),
    ...shorthands.border('1px', 'solid', '#d3b17d'),
    '::placeholder': {
      fontFamily: 'bootstrap-icons, inherit',
    },
  },
  clearBtn: {
    position: 'absolute',
    right: '4px',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    cursor: 'pointer',
    color: '#8a8886',
    borderRadius: '2px',
    ':hover': {
      backgroundColor: 'rgba(0,0,0,0.06)',
      color: '#323130',
    },
  },
  sortIndicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    marginLeft: '4px',
    opacity: 0.5,
    cursor: 'default',
    transition: 'opacity 0.15s',
    ':hover': {
      opacity: 0.8,
    },
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
  sorter = 'name-asc',
}) => {
  const styles = useStyles();
  const { t } = useTranslation('menu');
  return (
    <div className={styles.root}>
      <span className={styles.prefix}>
        <TextHangingRegular onClick={onPrefixIconClick} fontSize={22} />
      </span>
      <div className={styles.inputWrap}>
        <input
          className={styles.input}
          value={searchText}
          type="text"
          onChange={(e) => onTextChange?.(e.target.value)}
          placeholder={`${SEARCH_ICON} ${t('searchFiles')}`}
        />
        {searchText && (
          <span
            className={styles.clearBtn}
            onClick={() => onTextChange?.('')}
            title={t('clearSearch')}
          >
            <DismissRegular fontSize={12} />
          </span>
        )}
      </div>
      <span className={styles.sortIndicator} title={t(SORTER_I18N_KEY[sorter])}>
        <Icon type={SORTER_ICON[sorter]} size={14} />
      </span>
      <Icon className={styles.suffix} type="plus" onClick={onNoteCreate} />
    </div>
  );
};

export default ListHeader;
