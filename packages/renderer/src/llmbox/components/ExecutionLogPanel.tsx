import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import type { AgentStore } from '../store';
import type { TodoItem } from '../types';
import styles from './AgentPanel.module.scss';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Icon from '/@/components/Icon';

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
                styles[`LogItem${capitalize(step.type)}`]
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
                    <Icon
                      type={isCollapsed ? 'caret-right' : 'caret-down'}
                      size={12}
                      className={styles.LogItemCollapseIcon}
                    />
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
                {'content' in step && (
                  <div className={styles.LogContent}>
                    <div className="markdown-body">
                      <Markdown remarkPlugins={[remarkGfm]}>
                        {(step as any).content}
                      </Markdown>
                    </div>
                  </div>
                )}

                {'toolName' in step && (
                  <div className={styles.LogTool}>
                    <Icon type="arrow-right" size={12} className={styles.LogToolLabel} />
                    <span className={styles.LogToolName}>
                      {(step as any).toolName}
                    </span>
                  </div>
                )}

                {'params' in step && (
                  <div className={styles.ToolParams}>
                    <div className={styles.ToolParamsLabel}>Parameters</div>
                    <pre className={styles.ToolParamsContent}>
                      {JSON.stringify((step as any).params, null, 2)}
                    </pre>
                  </div>
                )}

                {'result' in step && (step as any).result !== undefined && (
                  <details
                    className={`${styles.LogDetails} ${styles.LogDetailsResult}`}
                  >
                    <summary className={styles.LogDetailsToggle}>
                      <Icon type="check-circle" size={14} />
                      <span>Result</span>
                    </summary>
                    <div className={styles.LogDetailsContent}>
                      {typeof (step as any).result === 'string' ? (
                        <div className="markdown-body">
                          <Markdown remarkPlugins={[remarkGfm]}>
                            {(step as any).result}
                          </Markdown>
                        </div>
                      ) : (
                        <pre>
                          {JSON.stringify((step as any).result, null, 2)}
                        </pre>
                      )}
                    </div>
                  </details>
                )}

                {'error' in step && (step as any).error && (
                  <div className={styles.LogError}>
                    <Icon type="x-circle" size={14} className={styles.LogErrorIcon} />
                    <span className={styles.LogErrorText}>
                      <div className="markdown-body">
                        <Markdown remarkPlugins={[remarkGfm]}>
                          {(step as any).error}
                        </Markdown>
                      </div>
                    </span>
                  </div>
                )}

                {'todos' in step && (step as any).todos && (step as any).todos.length > 0 && (
                  <div className={styles.TodoList}>
                    <TodoTree todos={(step as any).todos} />
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

function formatTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 60000) {
    return 'Just now';
  } else if (diff < 3600000) {
    const mins = Math.floor(diff / 60000);
    return `${mins}m ago`;
  }
  return new Date(timestamp).toLocaleTimeString();
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
        <span className={styles.TodoIcon}>
          {todo.status === 'completed' ? (
            <Icon type="check-circle-fill" size={14} />
          ) : todo.status === 'in_progress' ? (
            <Icon type="arrow-repeat" size={14} />
          ) : todo.status === 'failed' ? (
            <Icon type="x-circle-fill" size={14} />
          ) : (
            <Icon type="clock-history" size={14} />
          )}
        </span>
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

export default ExecutionLogPanel;
