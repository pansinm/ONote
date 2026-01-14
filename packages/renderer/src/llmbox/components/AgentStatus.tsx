import React from 'react';
import { observer } from 'mobx-react-lite';
import type { AgentStore } from '../AgentStore';

interface AgentStatusProps {
  store: AgentStore;
}

export const AgentStatus = observer(({ store }: AgentStatusProps) => {
  const completedTodos = store.todos.filter((t) => t.status === 'completed').length;

  return (
    <div className="agent-status">
      <span className={`status-dot status-${store.agentState}`} />
      <span className="status-text">{store.agentState}</span>
      {store.todos.length > 0 && (
        <span className="todo-progress">
          <span className="todo-label">Tasks:</span>
          <span className="todo-count">{completedTodos}/{store.todos.length}</span>
        </span>
      )}
      <span className="task-count">{store.executionLog.length} tasks</span>
      <span className="message-count">{store.conversationHistory.length} messages</span>
      {store.error && <span className="error-indicator" title={store.error}>⚠️</span>}
    </div>
  );
});

export default AgentStatus;
