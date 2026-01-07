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
    <div className={styles.AgentPanel}>
      <div className={styles.AgentToolbar}>
        <div className={styles.ToolbarLeft}>
          <div className={styles.AgentTitle}>🤖 AI Agent</div>
          <div className={styles.StatusIndicator}>
            <span className={styles.StatusDot} data-state={store.agentState}></span>
            <span className={styles.StatusText}>{store.agentState}</span>
            <span className={styles.TaskCount}>{store.executionLog.length} tasks</span>
            <span className={styles.MessageCount}>{store.conversationHistory.length} messages</span>
          </div>
          {store.error && (
            <div className={styles.ErrorIndicator} title={store.error}>
              ⚠️
            </div>
          )}
        </div>

        <div className={styles.ToolbarRight}>
          <button
            className={`${styles.ActionBtn} ${styles.IconOnly} ${styles.ClearHistoryBtn}`}
            onClick={() => store.clearConversation()}
            disabled={store.isRunning}
            title="Clear History"
          >
            🔄
          </button>

          <button
            className={`${styles.ActionBtn} ${styles.IconOnly} ${styles.ClearBtn}`}
            onClick={() => store.clearLog()}
            disabled={store.isRunning}
            title="Clear"
          >
            🗑️
          </button>

          {store.isRunning && (
            <button
              className={`${styles.ActionBtn} ${styles.IconOnly} ${styles.StopBtn}`}
              onClick={() => store.stopAgent()}
              title="Stop"
            >
              ⏹️
            </button>
          )}
        </div>
      </div>

      <div className={styles.TabContent}>
        <div className={`${styles.TabPane} ${activeTab === 'execution' ? styles.active : ''}`}>
          {store.executionLog.length === 0 ? (
            <div className={styles.EmptyState}>
              <div className={styles.EmptyIcon}>📝</div>
              <div className={styles.EmptyMessage}>No execution history yet</div>
              <div className={styles.EmptyHint}>
                Enter a task below to start the agent
              </div>
            </div>
          ) : (
            <div className={styles.ExecutionLog}>
              <div className={styles.LogList}>
                {store.executionLog.map((step, index) => (
                  <div
                    key={step.id}
                    className={`${styles.LogItem} ${styles[`logItem${capitalize(step.type)}`]}`}
                  >
                    <div className={styles.LogHeader}>
                      <span className={styles.LogIndex}>{index + 1}</span>
                      <span className={styles.LogType}>{step.type}</span>
                      <span className={styles.LogTime}>{formatTime(step.timestamp)}</span>
                      {step.duration && (
                        <span className={styles.LogDuration}>{(step.duration / 1000).toFixed(2)}s</span>
                      )}
                    </div>

                    <div className={styles.LogBody}>
                      {step.content && (
                        <div className={styles.LogContent}>
                          <div className="markdown-body">
                            <Markdown remarkPlugins={[remarkGfm]}>
                              {step.content}
                            </Markdown>
                          </div>
                        </div>
                      )}

                      {step.toolName && (
                        <div className={styles.LogTool}>
                          <span className={styles.LogToolLabel}>→</span>
                          <span className={styles.LogToolName}>{step.toolName}</span>
                        </div>
                      )}

                      {step.toolParams && (
                        <details className={styles.LogDetails}>
                          <summary className={styles.LogDetailsToggle}>
                            <span>📦 Parameters</span>
                          </summary>
                          <pre className={styles.LogDetailsContent}>
                            {JSON.stringify(step.toolParams, null, 2)}
                          </pre>
                        </details>
                      )}

                      {step.toolResult && (
                        <details className={`${styles.LogDetails} ${styles.LogDetailsResult}`}>
                          <summary className={styles.LogDetailsToggle}>
                            <span>✅ Result</span>
                          </summary>
                          <div className={styles.LogDetailsContent}>
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
                        <div className={styles.LogError}>
                          <span className={styles.LogErrorIcon}>❌</span>
                          <span className={styles.LogErrorText}>
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

        <div className={`${styles.TabPane} ${activeTab === 'tools' ? styles.active : ''}`}>
          <div className={styles.ToolsContent}>
            <div className={styles.ToolsGrid}>
              {store.tools.map(tool => (
                <div
                  key={tool.name}
                  className={`${styles.ToolCard} ${selectedTool === tool.name ? styles.Selected : ''}`}
                  onClick={() => handleToolClick(tool.name)}
                  title={tool.description}
                >
                  <div className={styles.ToolIcon}>
                    {getToolIcon(tool.name)}
                  </div>
                  <div className={styles.ToolInfo}>
                    <div className={styles.ToolHeaderInfo}>
                      <span className={styles.ToolName}>{tool.name}</span>
                      {tool.metadata?.dangerous && (
                        <span className={styles.ToolBadge}>⚠️</span>
                      )}
                      <span className={`${styles.ToolBadge} ${styles.Permission} ${styles[tool.metadata?.permission || 'read']}`}>
                        {tool.metadata?.permission}
                      </span>
                    </div>
                    <p className={styles.ToolDesc}>{tool.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.BottomTabs}>
        <button
          className={`${styles.BottomTabItem} ${activeTab === 'execution' ? styles.active : ''}`}
          onClick={() => setActiveTab('execution')}
        >
          📋 Execution Log
        </button>
        <button
          className={`${styles.BottomTabItem} ${activeTab === 'tools' ? styles.active : ''}`}
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
