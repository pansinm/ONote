import React from 'react';
import { observer } from 'mobx-react-lite';
import type { AgentStore } from './AgentStore';
import { useState } from 'react';
import styles from './AgentPanel.module.scss';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AgentPanelProps {
  store: AgentStore;
}

const AgentPanel = observer(({ store }: AgentPanelProps) => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'execution' | 'tools'>('execution');

  const handleToolClick = (toolName: string) => {
    setSelectedTool(toolName === selectedTool ? null : toolName);
  };

  return (
    <div className={styles.agentPanel}>
      <div className={styles.agentToolbar}>
        <div className={styles.toolbarLeft}>
          <div className={styles.agentTitle}>🤖 AI Agent</div>
          <div className={styles.statusIndicator}>
            <span className={styles.statusDot} data-state={store.agentState}></span>
            <span className={styles.statusText}>{store.agentState}</span>
            <span className={styles.taskCount}>{store.executionLog.length} tasks</span>
          </div>
          {store.error && (
            <div className={styles.errorIndicator} title={store.error}>
              ⚠️
            </div>
          )}
        </div>

        <div className={styles.toolbarRight}>
          <button
            className={`${styles.actionBtn} ${styles.iconOnly} ${styles.clearBtn}`}
            onClick={() => store.clearLog()}
            disabled={store.isRunning}
            title="Clear"
          >
            🗑️
          </button>

          {store.isRunning && (
            <button
              className={`${styles.actionBtn} ${styles.iconOnly} ${styles.stopBtn}`}
              onClick={() => store.stopAgent()}
              title="Stop"
            >
              ⏹️
            </button>
          )}
        </div>
      </div>

      <div className={styles.tabContent}>
        <div className={`${styles.tabPane} ${activeTab === 'execution' ? styles.active : ''}`}>
          {store.executionLog.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📝</div>
              <div className={styles.emptyMessage}>No execution history yet</div>
              <div className={styles.emptyHint}>
                Enter a task below to start the agent
              </div>
            </div>
          ) : (
            <div className={styles.executionLog}>
              <div className={styles.logList}>
                {store.executionLog.map((step, index) => (
                  <div
                    key={step.id}
                    className={`${styles.logItem} ${styles[`logItem${capitalize(step.type)}`]}`}
                  >
                    <div className={styles.logHeader}>
                      <span className={styles.logIndex}>{index + 1}</span>
                      <span className={styles.logType}>{step.type}</span>
                      <span className={styles.logTime}>{formatTime(step.timestamp)}</span>
                      {step.duration && (
                        <span className={styles.logDuration}>{(step.duration / 1000).toFixed(2)}s</span>
                      )}
                    </div>

                    <div className={styles.logBody}>
                      {step.content && (
                        <div className={styles.logContent}>
                          <div className="markdown-body">
                            <Markdown remarkPlugins={[remarkGfm]}>
                              {step.content}
                            </Markdown>
                          </div>
                        </div>
                      )}

                      {step.toolName && (
                        <div className={styles.logTool}>
                          <span className={styles.logToolLabel}>→</span>
                          <span className={styles.logToolName}>{step.toolName}</span>
                        </div>
                      )}

                      {step.toolParams && (
                        <details className={styles.logDetails}>
                          <summary className={styles.logDetailsToggle}>
                            <span>📦 Parameters</span>
                          </summary>
                          <pre className={styles.logDetailsContent}>
                            {JSON.stringify(step.toolParams, null, 2)}
                          </pre>
                        </details>
                      )}

                      {step.toolResult && (
                        <details className={`${styles.logDetails} ${styles.logDetailsResult}`}>
                          <summary className={styles.logDetailsToggle}>
                            <span>✅ Result</span>
                          </summary>
                          <div className={styles.logDetailsContent}>
                            {typeof step.toolResult === 'string' ? (
                              <div className="markdown-body">
                                <Markdown remarkPlugins={[remarkGfm]}>
                                  {step.toolResult}
                                </Markdown>
                              </div>
                            ) : (
                              <pre>{JSON.stringify(step.toolResult, null, 2)}</pre>
                            )}
                          </div>
                        </details>
                      )}

                      {step.error && (
                        <div className={styles.logError}>
                          <span className={styles.logErrorIcon}>❌</span>
                          <span className={styles.logErrorText}>
                            <div className="markdown-body">
                              <Markdown remarkPlugins={[remarkGfm]}>
                                {step.error}
                              </Markdown>
                            </div>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={`${styles.tabPane} ${activeTab === 'tools' ? styles.active : ''}`}>
          <div className={styles.toolsContent}>
            <div className={styles.toolsGrid}>
              {store.tools.map(tool => (
                <div
                  key={tool.name}
                  className={`${styles.toolCard} ${selectedTool === tool.name ? styles.selected : ''}`}
                  onClick={() => handleToolClick(tool.name)}
                  title={tool.description}
                >
                  <div className={styles.toolIcon}>
                    {getToolIcon(tool.name)}
                  </div>
                  <div className={styles.toolInfo}>
                    <div className={styles.toolHeaderInfo}>
                      <span className={styles.toolName}>{tool.name}</span>
                      {tool.metadata?.dangerous && (
                        <span className={styles.toolBadge}>⚠️</span>
                      )}
                      <span className={`${styles.toolBadge} ${styles.permission} ${styles[tool.metadata?.permission || 'read']}`}>
                        {tool.metadata?.permission}
                      </span>
                    </div>
                    <p className={styles.toolDesc}>{tool.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottomTabs}>
        <button
          className={`${styles.bottomTabItem} ${activeTab === 'execution' ? styles.active : ''}`}
          onClick={() => setActiveTab('execution')}
        >
          📋 Execution Log
        </button>
        <button
          className={`${styles.bottomTabItem} ${activeTab === 'tools' ? styles.active : ''}`}
          onClick={() => setActiveTab('tools')}
        >
          🔧 Tools ({store.tools.length})
        </button>
      </div>
    </div>
  );
});

function getToolIcon(toolName: string): string {
  const iconMap: Record<string, string> = {
    readFile: '📄',
    writeFile: '✏️',
    createFile: '📝',
    deleteFile: '🗑️',
    listFiles: '📂',
    searchFiles: '🔍',
    searchInFile: '🔎',
  };
  return iconMap[toolName] || '🔧';
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) {
    return 'Just now';
  } else if (diff < 3600000) {
    const mins = Math.floor(diff / 60000);
    return `${mins}m ago`;
  }
  return date.toLocaleTimeString();
}

export default AgentPanel;
