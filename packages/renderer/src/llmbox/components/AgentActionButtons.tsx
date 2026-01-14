import React from 'react';
import { observer } from 'mobx-react-lite';
import type { AgentStore } from '../AgentStore';

interface AgentActionButtonsProps {
  store: AgentStore;
}

export const AgentActionButtons = observer(({ store }: AgentActionButtonsProps) => {
  return (
    <div className="agent-actions">
      <button
        className="action-btn icon-only clear-history-btn"
        onClick={() => store.clearConversation()}
        disabled={store.isRunning}
        title="Clear History"
      >
        🔄
      </button>

      <button
        className="action-btn icon-only clear-btn"
        onClick={() => store.clearLog()}
        disabled={store.isRunning}
        title="Clear"
      >
        🗑️
      </button>

      {store.hasSavedState && !store.isRunning && (
        <button
          className="action-btn icon-only resume-btn"
          onClick={() => store.resumeExecution()}
          title="Resume from saved state"
        >
          ▶️
        </button>
      )}

      {store.hasSavedState && (
        <button
          className="action-btn icon-only clear-state-btn"
          onClick={() => store.deleteExecutionState()}
          disabled={store.isRunning}
          title="Clear saved state"
        >
          🗑️
        </button>
      )}

      {store.isRunning && (
        <button
          className="action-btn icon-only stop-btn"
          onClick={() => store.stopAgent()}
          title="Stop"
        >
          ⏹️
        </button>
      )}
    </div>
  );
});

export default AgentActionButtons;
