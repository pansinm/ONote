import React from 'react';
import { observer } from 'mobx-react-lite';
import type { AgentStore } from '../store';
import styles from './AgentPanel.module.scss';
import Icon from '/@/components/Icon';

interface AgentActionButtonsProps {
  store: AgentStore;
}

export const AgentActionButtons = observer(({ store }: AgentActionButtonsProps) => {
  return (
    <div className={styles.AgentActions}>
      <button
        className={styles.ActionBtn}
        onClick={() => store.clearConversation()}
        disabled={store.isRunning}
        title="Clear History"
      >
        <Icon type="arrow-clockwise" size={16} />
      </button>

      <button
        className={styles.ActionBtn}
        onClick={() => store.clearLog()}
        disabled={store.isRunning}
        title="Clear"
      >
        <Icon type="trash" size={16} />
      </button>

      {store.hasSavedState && !store.isRunning && (
        <button
          className={styles.ActionBtn}
          onClick={() => store.resumeExecution()}
          title="Resume from saved state"
        >
          <Icon type="play-fill" size={16} />
        </button>
      )}

      {store.hasSavedState && (
        <button
          className={styles.ActionBtn}
          onClick={() => store.deleteExecutionState()}
          disabled={store.isRunning}
          title="Clear saved state"
        >
          <Icon type="trash-fill" size={16} />
        </button>
      )}

      {store.isRunning && (
        <button
          className={styles.ActionBtn}
          onClick={() => store.stopAgent()}
          title="Stop"
        >
          <Icon type="stop-fill" size={16} />
        </button>
      )}
    </div>
  );
});

export default AgentActionButtons;
