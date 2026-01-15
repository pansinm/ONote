import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import type { Store } from '../store/Store';
import type {
  ExecutionStep,
  TodoItem,
} from '../types';
import styles from './AgentPanel.module.scss';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Icon from '/@/components/Icon';
import {
  capitalize,
  formatTime,
  getStepContent,
  getStepToolName,
  getStepParams,
  getStepResult,
  getStepError,
  getStepTodos,
  isThinkingStep,
} from '../utils/formatters';

interface ExecutionLogPanelProps {
  store: Store;
  logContainerRef: React.RefObject<HTMLDivElement>;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}

export const ExecutionLogPanel = observer(({ store, logContainerRef, onScroll }: ExecutionLogPanelProps) => {
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

  const renderStepContent = (step: ExecutionStep) => {
    const content = getStepContent(step);
    if (!content) return null;

    return (
      <div className={styles.LogContent}>
        <div className="markdown-body">
          <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
        </div>
      </div>
    );
  };

  const renderStepTool = (step: ExecutionStep) => {
    const toolName = getStepToolName(step);
    if (!toolName) return null;

    return (
      <div className={styles.LogTool}>
        <Icon type="arrow-right" size={12} className={styles.LogToolLabel} />
        <span className={styles.LogToolName}>{toolName}</span>
      </div>
    );
  };

  const renderStepParams = (step: ExecutionStep) => {
    const params = getStepParams(step);
    if (!params) return null;

    return (
      <div className={styles.ToolParams}>
        <div className={styles.ToolParamsLabel}>Parameters</div>
        <pre className={styles.ToolParamsContent}>
          {JSON.stringify(params, null, 2)}
        </pre>
      </div>
    );
  };

  const renderStepResult = (step: ExecutionStep) => {
    const result = getStepResult(step);
    if (result === undefined || result === null) return null;

    return (
      <details className={`${styles.LogDetails} ${styles.LogDetailsResult}`}>
        <summary className={styles.LogDetailsToggle}>
          <Icon type="check-circle" size={14} />
          <span>Result</span>
        </summary>
        <div className={styles.LogDetailsContent}>
          {typeof result === 'string' ? (
            <div className="markdown-body">
              <Markdown remarkPlugins={[remarkGfm]}>{result}</Markdown>
            </div>
          ) : (
            <pre>{JSON.stringify(result, null, 2)}</pre>
          )}
        </div>
      </details>
    );
  };

  const renderStepError = (step: ExecutionStep) => {
    const error = getStepError(step);
    if (!error) return null;

    return (
      <div className={styles.LogError}>
        <Icon type="x-circle" size={14} className={styles.LogErrorIcon} />
        <span className={styles.LogErrorText}>
          <div className="markdown-body">
            <Markdown remarkPlugins={[remarkGfm]}>{error}</Markdown>
          </div>
        </span>
      </div>
    );
  };

  const renderStepTodos = (step: ExecutionStep) => {
    const todos = getStepTodos(step);
    if (!todos || todos.length === 0) return null;

    return (
      <div className={styles.TodoList}>
        <TodoTree todos={todos} />
      </div>
    );
  };

  return (
    <div className={styles.ExecutionLog} ref={logContainerRef} onScroll={onScroll}>
      <div className={styles.LogList}>
        {store.steps.map((step, index) => {
          const isCollapsed = collapsedLogIds.has(step.id);
          const isCurrentlyThinking = isThinkingStep(step) && store.agentState === 'thinking';

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
                {isThinkingStep(step) && (
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
                {renderStepContent(step)}
                {renderStepTool(step)}
                {renderStepParams(step)}
                {renderStepResult(step)}
                {renderStepError(step)}
                {renderStepTodos(step)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

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
