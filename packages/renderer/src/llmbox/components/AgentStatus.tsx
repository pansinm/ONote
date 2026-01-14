import React from 'react';
import { observer } from 'mobx-react-lite';
import type { AgentStore } from '../store';
import styles from './AgentPanel.module.scss';
import Icon from '/@/components/Icon';

interface AgentStatusProps {
  store: AgentStore;
}

export const AgentStatus = observer(({ store }: AgentStatusProps) => {
  const completedTodos = store.todos.filter((t) => t.status === 'completed').length;

  return (
    <div className={styles.AgentStatus}>
      <span
        className={styles.StatusDot}
        data-state={store.agentState}
      />
      <span className={styles.StatusText}>{store.agentState}</span>
      {store.todos.length > 0 && (
        <span className={styles.TodoProgress}>
          <span className={styles.TodoLabel}>Tasks:</span>
          <span className={styles.TodoCount}>{completedTodos}/{store.todos.length}</span>
        </span>
      )}
      <span className={styles.TaskCount}>{store.executionLog.length} tasks</span>
      <span className={styles.MessageCount}>{store.conversationHistory.length} messages</span>
      {store.error && (
        <span className={styles.ErrorIndicator} title={store.error}>
          <Icon type="exclamation-triangle" size={14} />
        </span>
      )}
    </div>
  );
});

export default AgentStatus;
