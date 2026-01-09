import React, { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import type { AgentStore } from './AgentStore';
import type { TodoItem } from './agent/types';
import { useState } from 'react';
import styles from './AgentPanel.module.scss';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AgentPanelProps {
  store: AgentStore;
}

const AgentPanel = observer(({ store }: AgentPanelProps) => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'execution' | 'tools'>(
    'execution',
  );
  const [collapsedLogIds, setCollapsedLogIds] = useState<Set<string>>(
    new Set(),
  );

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
    const thinkingSteps = store.executionLog.filter(
      (step) => step.type === 'thinking',
    );
    const newCollapsedIds = new Set(thinkingSteps.map((step) => step.id));
    setCollapsedLogIds(newCollapsedIds);
  }, [store.executionLog]);

  const handleToolClick = (toolName: string) => {
    setSelectedTool(toolName === selectedTool ? null : toolName);
  };

  const toggleLogItemCollapse = (logId: string) => {
    setCollapsedLogIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  return (
    <div className={styles.AgentPanel}>
      <div className={styles.AgentToolbar}>
        <div className={styles.ToolbarLeft}>
          <div className={styles.AgentTitle}>🤖 AI Agent</div>
          <div className={styles.StatusIndicator}>
            <span
              className={styles.StatusDot}
              data-state={store.agentState}
            ></span>
            <span className={styles.StatusText}>{store.agentState}</span>
            {store.todos.length > 0 && (
              <span className={styles.TodoProgress}>
                <span className={styles.TodoLabel}>Tasks:</span>
                <span className={styles.TodoCount}>
                  {store.todos.filter((t) => t.status === 'completed').length}/
                  {store.todos.length}
                </span>
              </span>
            )}
            <span className={styles.TaskCount}>
              {store.executionLog.length} tasks
            </span>
            <span className={styles.MessageCount}>
              {store.conversationHistory.length} messages
            </span>
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

          {store.hasSavedState && !store.isRunning && (
            <button
              className={`${styles.ActionBtn} ${styles.IconOnly} ${styles.ResumeBtn}`}
              onClick={() => store.resumeExecution()}
              title="Resume from saved state"
            >
              ▶️
            </button>
          )}

          {store.hasSavedState && (
            <button
              className={`${styles.ActionBtn} ${styles.IconOnly} ${styles.ClearStateBtn}`}
              onClick={() => store.deleteExecutionState()}
              disabled={store.isRunning}
              title="Clear saved state"
            >
              🗑️
            </button>
          )}

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
        <div
          className={`${styles.TabPane} ${
            activeTab === 'execution' ? styles.active : ''
          }`}
        >
          {store.executionLog.length === 0 ? (
            <div className={styles.EmptyState}>
              <div className={styles.EmptyIcon}>📝</div>
              <div className={styles.EmptyMessage}>
                No execution history yet
              </div>
              <div className={styles.EmptyHint}>
                Enter a task below to start the agent
              </div>
            </div>
          ) : (
            <div className={styles.ExecutionLog} ref={logContainerRef}>
              <div className={styles.LogList}>
                {store.executionLog.map((step, index) => {
                  const isThinking = step.type === 'thinking';
                  const isCollapsed = collapsedLogIds.has(step.id);
                  const isCurrentlyThinking =
                    isThinking && store.agentState === 'thinking';

                  return (
                    <div
                      key={step.id}
                      className={`${styles.LogItem} ${
                        styles[`logItem${capitalize(step.type)}`]
                      } ${isCollapsed ? styles.collapsed : ''}`}
                    >
                      <div className={styles.LogHeader}>
                        <span className={styles.LogIndex}>{index + 1}</span>
                        <span className={styles.LogType}>{step.type}</span>
                        <span className={styles.LogTime}>
                          {formatTime(step.timestamp)}
                        </span>
                        {step.duration && (
                          <span className={styles.LogDuration}>
                            {(step.duration / 1000).toFixed(2)}s
                          </span>
                        )}
                        {isThinking && (
                          <button
                            className={styles.LogItemCollapseBtn}
                            onClick={() => toggleLogItemCollapse(step.id)}
                          >
                            <span
                              className={`${styles.LogItemCollapseIcon} ${
                                isCollapsed ? styles.collapsed : ''
                              }`}
                            >
                              {isCollapsed ? '▶' : '▼'}
                            </span>
                          </button>
                        )}
                      </div>

                      {isCurrentlyThinking && (
                        <div className={styles.LogItemLoading}>
                          <span className={styles.LoadingDot}></span>
                          <span className={styles.LoadingDot}></span>
                          <span className={styles.LoadingDot}></span>
                        </div>
                      )}

                      <div
                        className={`${styles.LogBody} ${
                          isCollapsed ? styles.collapsed : ''
                        }`}
                      >
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
                            <span className={styles.LogToolName}>
                              {step.toolName}
                            </span>
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

                        {step.toolResult ? (
                          <details
                            className={`${styles.LogDetails} ${styles.LogDetailsResult}`}
                          >
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
                                <pre>
                                  {JSON.stringify(step.toolResult, null, 2)}
                                </pre>
                              )}
                            </div>
                          </details>
                        ) : null}

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

                        {step.todos && step.todos.length > 0 && (
                          <div className={styles.TodoList}>
                            <TodoTree todos={step.todos} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div
          className={`${styles.TabPane} ${
            activeTab === 'tools' ? styles.active : ''
          }`}
        >
          <div className={styles.ToolsContent}>
            <div className={styles.ToolsGrid}>
              {store.tools.map((tool) => (
                <div
                  key={tool.name}
                  className={`${styles.ToolCard} ${
                    selectedTool === tool.name ? styles.Selected : ''
                  }`}
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
                      <span
                        className={`${styles.ToolBadge} ${styles.Permission} ${
                          styles[tool.metadata?.permission || 'read']
                        }`}
                      >
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
          className={`${styles.BottomTabItem} ${
            activeTab === 'execution' ? styles.active : ''
          }`}
          onClick={() => setActiveTab('execution')}
        >
          📋 Execution Log
        </button>
        <button
          className={`${styles.BottomTabItem} ${
            activeTab === 'tools' ? styles.active : ''
          }`}
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

function getTodoIcon(status: string): string {
  const iconMap: Record<string, string> = {
    pending: '⏳',
    in_progress: '🔄',
    completed: '✅',
    failed: '❌',
  };
  return iconMap[status] || '⏳';
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

interface TodoTreeProps {
  todos: TodoItem[];
}

function TodoTree({ todos }: TodoTreeProps) {
  const tree = buildTodoTree(todos);

  const renderTodoNode = (todo: TodoItem, level: number) => (
    <React.Fragment key={todo.id}>
      <div
        className={`${styles.TodoItem} ${
          styles[`Todo${capitalize(todo.status)}`]
        }`}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
      >
        <span className={styles.TodoIcon}>{getTodoIcon(todo.status)}</span>
        <span className={styles.TodoDescription}>{todo.description}</span>
      </div>
      {todo.children &&
        todo.children.length > 0 &&
        todo.children.map((child) => renderTodoNode(child, level + 1))}
    </React.Fragment>
  );

  return <>{tree.map((todo) => renderTodoNode(todo, 0))}</>;
}

function buildTodoTree(flatTodos: TodoItem[]): TodoItem[] {
  const todoMap = new Map<string, TodoItem>();
  const rootTodos: TodoItem[] = [];

  flatTodos.forEach((todo) => {
    todoMap.set(todo.id, { ...todo, children: [] });
  });

  flatTodos.forEach((todo) => {
    const todoWithChildren = todoMap.get(todo.id);
    if (!todoWithChildren) return;

    if (todo.parentId) {
      const parent = todoMap.get(todo.parentId);
      if (parent) {
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(todoWithChildren);
        todoWithChildren.level = (parent.level || 0) + 1;
      } else {
        rootTodos.push(todoWithChildren);
        todoWithChildren.level = 0;
      }
    } else {
      rootTodos.push(todoWithChildren);
      todoWithChildren.level = 0;
    }
  });

  return rootTodos;
}

export default AgentPanel;
