import React from 'react';
import { observer } from 'mobx-react-lite';
import type { AgentStore } from '../store';
import { AgentStatus } from './AgentStatus';
import { AgentActionButtons } from './AgentActionButtons';
import Icon from '/@/components/Icon';
import styles from './AgentPanel.module.scss';

interface AgentToolbarProps {
  store: AgentStore;
}

export const AgentToolbar = observer(({ store }: AgentToolbarProps) => {
  return (
    <div className={styles.AgentToolbar}>
      <div className={styles.ToolbarLeft}>
        <div className={styles.AgentTitle}>
          <Icon type="robot" size={18} />
          <span>AI Agent</span>
        </div>
        <AgentStatus store={store} />
      </div>
      <AgentActionButtons store={store} />
    </div>
  );
});

export default AgentToolbar;
