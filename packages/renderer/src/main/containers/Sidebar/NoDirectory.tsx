import { makeStyles } from '@fluentui/react-components';
import { BookOpenRegular } from '@fluentui/react-icons';
import type { FC, ReactNode } from 'react';
import React from 'react';

const useStyles = makeStyles({
  root: {
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  icon: {
    color: '#8a7e6b',
  },
  text: {
    color: '#8a7e6b',
    fontSize: '13px',
    maxWidth: '140px',
    textAlign: 'center',
    lineHeight: 1.4,
  },
});

const NoDirectory: FC<{ children: ReactNode }> = (props) => {
  const styles = useStyles();
  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <BookOpenRegular className={styles.icon} fontSize={48} />
        <p className={styles.text}>{props.children}</p>
      </div>
    </div>
  );
};

export default NoDirectory;
