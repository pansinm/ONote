import React, { useEffect, useRef, useCallback, useState } from 'react';
import { observer } from 'mobx-react-lite';
import type { Store } from '../store/Store';
import styles from './AgentPanel.module.scss';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AgentToolbar } from './AgentToolbar';
import { ExecutionLogPanel } from './ExecutionLogPanel';
import { ToolsPanel } from './ToolsPanel';
import { BottomTabs } from './BottomTabs';
import { EmptyState } from './EmptyState';

interface AgentPanelProps {
  store: Store;
}

const AgentPanel = observer(({ store }: AgentPanelProps) => {
  const [activeTab, setActiveTab] = useState<'execution' | 'tools'>(
    'execution',
  );
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const logContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);

  const scrollToBottom = useCallback(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'execution') {
      scrollToBottom();
    }
  }, [store.steps, store.agentState, activeTab, scrollToBottom]);

  useEffect(() => {
    if (store.agentState === 'thinking' && store.isRunning) {
      const scroll = () => {
        if (logContainerRef.current) {
          logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
      };

      scrollTimerRef.current = requestAnimationFrame(function animate() {
        scroll();
        if (store.agentState === 'thinking' && store.isRunning) {
          scrollTimerRef.current = requestAnimationFrame(animate);
        }
      });

      return () => {
        if (scrollTimerRef.current) {
          cancelAnimationFrame(scrollTimerRef.current);
        }
      };
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
          {store.steps.length === 0 ? (
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
