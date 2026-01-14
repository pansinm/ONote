import React, { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import type { AgentStore } from './AgentStore';
import type { TodoItem } from './core/types';
import styles from './AgentPanel.module.scss';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AgentToolbar } from './components/AgentToolbar';
import { ExecutionLogPanel } from './components/ExecutionLogPanel';
import { ToolsPanel } from './components/ToolsPanel';
import { BottomTabs } from './components/BottomTabs';
import { EmptyState } from './components/EmptyState';

interface AgentPanelProps {
  store: AgentStore;
}

const AgentPanel = observer(({ store }: AgentPanelProps) => {
  const [activeTab, setActiveTab] = useState<'execution' | 'tools'>(
    'execution',
  );
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const logContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (activeTab === 'execution') {
      scrollToBottom();
    }
  }, [store.executionLog, store.agentState, activeTab]);

  useEffect(() => {
    if (store.agentState === 'thinking' && store.isRunning) {
      const timer = setInterval(() => {
        scrollToBottom();
      }, 100);
      return () => clearInterval(timer);
    }
  }, [store.agentState, store.isRunning, activeTab]);

  return (
    <div className={styles.AgentPanel}>
      <AgentToolbar store={store} />
      <div className={styles.TabContent}>
        <div
          className={`${styles.TabPane} ${
            activeTab === 'execution' ? styles.active : ''
          }`}
        >
          {store.executionLog.length === 0 ? (
            <EmptyState />
          ) : (
            <ExecutionLogPanel
              store={store}
              logContainerRef={logContainerRef}
            />
          )}
        </div>
        <div
          className={`${styles.TabPane} ${
            activeTab === 'tools' ? styles.active : ''
          }`}
        >
          <ToolsPanel
            store={store}
            selectedTool={selectedTool}
            onToolSelect={setSelectedTool}
          />
        </div>
      </div>
      <BottomTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        toolCount={store.tools.length}
      />
    </div>
  );
});

export default AgentPanel;
