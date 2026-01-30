/**
 * Agent消息组件
 * 1. 受控组件
 * 2. 支持 className 和 style，默认样式美观且符合整体项目风格
 * 3. 支持消息，消息包含用户消息和Agent消息，消息定义参考 ../types/IMessage
 * 4. Agent消息显示当前任务列表
 */

/* eslint-disable react/prop-types */

import classNames from 'classnames';
import type { FC } from 'react';
import React, { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import {
  CheckmarkCircle12Regular,
  ArrowClockwise12Regular,
  ChevronDown12Regular,
} from '@fluentui/react-icons';
import type {
  Message as IMessage,
  UserMessage,
  AgentMessage,
  WorkStep,
  ToolCall,
} from '../types/IMessage';
import styles from './Message.module.scss';

// ========== Props 接口 ==========
export interface MessageProps {
  // 消息内容
  message: IMessage;

  // 自定义容器类名（用于外部样式覆盖）
  className?: string;

  // 自定义容器样式（用于外部样式定义）
  style?: React.CSSProperties;
}

// ========== 类型守卫函数 ==========
function isUserMessage(message: IMessage): message is UserMessage {
  return message.role === 'user';
}

function isAgentMessage(message: IMessage): message is AgentMessage {
  return message.role === 'assistant';
}

const markdownComponents: Components = {
  p: ({ children }) => <p className={styles.markdownP}>{children}</p>,
  code: ({ className, children }) => {
    const isInline = !className || !className.startsWith('language-');
    return isInline
      ? <code className={styles.markdownCodeInline}>{children}</code>
      : <code className={className}>{children}</code>;
  },
  pre: ({ children }) => <pre className={styles.markdownCodeBlock}>{children}</pre>,
  ul: ({ children }) => <ul className={styles.markdownUl}>{children}</ul>,
  ol: ({ children }) => <ol className={styles.markdownOl}>{children}</ol>,
  li: ({ children }) => <li className={styles.markdownLi}>{children}</li>,
  blockquote: ({ children }) => <blockquote className={styles.markdownBlockquote}>{children}</blockquote>,
  a: ({ href, children }) => (
    <a
      href={href}
      className={styles.markdownLink}
      onClick={(e) => { e.preventDefault(); }}
    >
      {children}
    </a>
  ),
  strong: ({ children }) => <strong className={styles.markdownStrong}>{children}</strong>,
  em: ({ children }) => <em className={styles.markdownEm}>{children}</em>,
  del: ({ children }) => <del className={styles.markdownDel}>{children}</del>,
  h1: ({ children }) => <h1 className={styles.markdownH1}>{children}</h1>,
  h2: ({ children }) => <h2 className={styles.markdownH2}>{children}</h2>,
  h3: ({ children }) => <h3 className={styles.markdownH3}>{children}</h3>,
};

const MarkdownStepContent: FC<{ content: string }> = React.memo(({ content }) => (
  <div className={styles.workStep__content}>
    <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
  </div>
));

MarkdownStepContent.displayName = 'MarkdownStepContent';

// ========== 工具调用详情子组件 ==========
interface ToolCallDetailsProps {
  toolCall: ToolCall;
}

const ToolCallDetails: FC<ToolCallDetailsProps> = React.memo(({ toolCall }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleExpanded();
      }
    },
    [toggleExpanded],
  );

  // 格式化参数为 JSON 字符串
  const formatArguments = (args: Record<string, unknown>): string => {
    try {
      return JSON.stringify(args, null, 2);
    } catch {
      return String(args);
    }
  };

  return (
    <div className={styles.toolCall}>
      <button
        type="button"
        className={styles.toolCallHeader}
        onClick={toggleExpanded}
        onKeyDown={handleKeyDown}
        aria-expanded={isExpanded}
        aria-label={`Toggle tool call details for ${toolCall.name}`}
      >
        <div className={styles.toolCallHeader__left}>
          <i className="bi bi-gear" aria-hidden="true" />
          <span className={styles.toolCallHeader__name}>{toolCall.name}</span>
        </div>
        <ChevronDown12Regular
          className={classNames(
            styles.toolCallHeader__expand,
            isExpanded && styles.expanded,
          )}
        />
      </button>

      {isExpanded && (
        <div className={styles.toolCallBody}>
          <div className={styles.toolCallSection}>
            <span className={styles.toolCallSection__label}>Arguments:</span>
            <pre className={styles.toolCallArguments}>
              {formatArguments(toolCall.arguments)}
            </pre>
          </div>

          {toolCall.result && (
            <div className={styles.toolCallSection}>
              <span className={styles.toolCallSection__label}>Result:</span>
              <div className={styles.toolCallResult}>{toolCall.result}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

ToolCallDetails.displayName = 'ToolCallDetails';

// ========== 工作步骤子组件 ==========
interface WorkStepItemProps {
  step: WorkStep;
}

const WorkStepItem: FC<WorkStepItemProps> = React.memo(({ step }) => {
  const renderStepIcon = () => {
    switch (step.type) {
      case 'thinking':
        return <i className="bi bi-lightbulb" aria-hidden="true" />;
      case 'tool_call':
        return <i className="bi bi-gear" aria-hidden="true" />;
      case 'summary':
        if (step.isCompleted) {
          return (
            <CheckmarkCircle12Regular
              className={styles.statusIcon__completed}
              aria-label="Completed"
            />
          );
        }
        return (
          <ArrowClockwise12Regular
            className={styles.statusIcon__inProgress}
            aria-label="In progress"
          />
        );
      default:
        return null;
    }
  };

  const renderStepContent = () => {
    if (step.type === 'tool_call' && step.toolCalls) {
      return (
        <div className={styles.workStep__content}>
          {step.toolCalls.map((toolCall) => (
            <ToolCallDetails key={toolCall.id} toolCall={toolCall} />
          ))}
        </div>
      );
    }

    return <MarkdownStepContent content={step.content} />;
  };

  return (
    <div
      className={classNames(styles.workStep, styles[`workStep--${step.type}`])}
    >
      <div className={styles.workStep__header}>
        {renderStepIcon()}
        {step.type === 'thinking' && <span>Thinking</span>}
        {step.type === 'tool_call' && <span>Tool Call</span>}
        {step.type === 'summary' && <span>Summary</span>}
        {step.type === 'summary' && !step.isCompleted && (
          <div className={styles.streamingIndicator}>
            <div className={styles.streamingDots}>
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
            </div>
            <span className={styles.streamingText}>Generating...</span>
          </div>
        )}
      </div>
      {renderStepContent()}
    </div>
  );
});

WorkStepItem.displayName = 'WorkStepItem';

// ========== 用户消息子组件 ==========
interface UserMessageBubbleProps {
  message: UserMessage;
}

const UserMessageBubble: FC<UserMessageBubbleProps> = ({ message }) => {
  return (
    <div className={styles.userContent}>
      <ReactMarkdown components={markdownComponents}>{message.content}</ReactMarkdown>
      <div className={styles.userTimestamp}>
        {new Date(message.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
};

// ========== Agent 消息子组件 ==========
interface AgentMessageContainerProps {
  message: AgentMessage;
}

const AgentMessageContainer: FC<AgentMessageContainerProps> = ({ message }) => {
  const hasSteps = message.steps && message.steps.length > 0;

  return (
    <div className={styles.agentContent}>
      {hasSteps ? (
        <div className={styles.workSteps}>
          {message.steps.map((step, index) => (
            <WorkStepItem key={`${message.id}-step-${index}`} step={step} />
          ))}
        </div>
      ) : (
        <div className={styles.workStep__content}>{message.content}</div>
      )}
    </div>
  );
};

// ========== 主组件 ==========
const Message: FC<MessageProps> = ({ message, className, style }) => {
  if (isUserMessage(message)) {
    return (
      <div
        className={classNames(
          styles.message,
          styles['message--user'],
          className,
        )}
        style={style}
      >
        <UserMessageBubble message={message} />
      </div>
    );
  }

  if (isAgentMessage(message)) {
    return (
      <div
        className={classNames(
          styles.message,
          styles['message--agent'],
          className,
        )}
        style={style}
      >
        <AgentMessageContainer message={message} />
      </div>
    );
  }

  // 系统消息（暂不处理）
  return null;
};

export default Message;
