import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import type { AgentStore } from '../AgentStore';
import type { TodoItem } from '../core/types';
import styles from '../AgentPanel.module.scss';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ExecutionLogPanelProps {
  store: AgentStore;
  logContainerRef: React.RefObject<HTMLDivElement>;
}

export const ExecutionLogPanel = observer(({ store, logContainerRef }: ExecutionLogPanelProps) => {
  const [collapsedLogIds, setCollapsedLogIds] = useState<Set<string>>(new Set());

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
                  <div className={styles.ToolParams}>
                    <div className={styles.ToolParamsLabel}>Parameters</div>
                    <pre className={styles.ToolParamsContent}>
                      {JSON.stringify(step.toolParams, null, 2)}
                    </pre>
                  </div>
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
  );
});

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

function getTodoIcon(status: string): string {
  const iconMap: Record<string, string> = {
    pending: '⏳',
    in_progress: '🔄',
    completed: '✅',
    failed: '❌',
  };
  return iconMap[status] || '⏳';
}

export default ExecutionLogPanel;
