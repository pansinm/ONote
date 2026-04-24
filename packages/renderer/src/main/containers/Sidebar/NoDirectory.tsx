import { BookOpenRegular } from '@fluentui/react-icons';
import type { FC, ReactNode } from 'react';
import React from 'react';
import styles from './NoDirectory.module.scss';

const NoDirectory: FC<{ children: ReactNode }> = (props) => {
  return (
    <div className={styles.NoDirectory}>
      <div className={styles.content}>
        <BookOpenRegular className={styles.icon} fontSize={48} />
        <p className={styles.text}>{props.children}</p>
      </div>
    </div>
  );
};

export default NoDirectory;
