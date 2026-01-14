import React from 'react';
import styles from '../AgentPanel.module.scss';

export const EmptyState: React.FC = () => {
  return (
    <div className={styles.EmptyState}>
      <div className={styles.EmptyIcon}>📝</div>
      <div className={styles.EmptyMessage}>
        No execution history yet
      </div>
      <div className={styles.EmptyHint}>
        Enter a task below to start agent
      </div>
    </div>
  );
};

export default EmptyState;
