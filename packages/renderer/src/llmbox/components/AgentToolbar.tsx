import React from 'react';
import { observer } from 'mobx-react-lite';
import type { AgentStore } from '../AgentStore';
import { AgentStatus } from './AgentStatus';
import { AgentActionButtons } from './AgentActionButtons';

interface AgentToolbarProps {
  store: AgentStore;
}

export const AgentToolbar = observer(({ store }: AgentToolbarProps) => {
  return (
    <div className="agent-toolbar">
      <div className="toolbar-left">
        <div className="agent-title">🤖 AI Agent</div>
        <AgentStatus store={store} />
      </div>
      <AgentActionButtons store={store} />
    </div>
  );
});

export default AgentToolbar;
