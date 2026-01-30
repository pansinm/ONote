import React, { type FC } from 'react';
import styles from './SessionDivider.module.scss';

const SessionDivider: FC = () => {
  return (
    <div className={styles.sessionDivider}>
      <span className={styles.label}>以下是新对话</span>
    </div>
  );
};

export default SessionDivider;
