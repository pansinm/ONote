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
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { useTranslation } from 'react-i18next';
import {
  CheckmarkCircle12Regular,
  ArrowClockwise12Regular,
  ChevronDown12Regular,
  Sparkle24Regular,
  Chat20Regular,
  Wrench16Regular,
} from '@fluentui/react-icons';

// 暖色代码高亮主题 — 与 ONote 书写氛围一致
const warmLight: Record<string, React.CSSProperties> = {
  'code[class*="language-"]': {
    color: '#4a3f35',
    background: 'none',
    textShadow: 'none',
    fontFamily: "'Droid Sans Mono', 'Consolas', monospace",
    fontSize: '1em',
    lineHeight: '1.5',
    whiteSpace: 'pre-wrap',
    wordWrap: 'normal',
    wordBreak: 'normal',
    tabSize: '2',
    hyphens: 'none',
  },
  'pre[class*="language-"]': {
    color: '#4a3f35',
    background: '#f0ebe0',
    borderRadius: '6px',
    textShadow: 'none',
    fontFamily: "'Droid Sans Mono', 'Consolas', monospace",
    fontSize: '1em',
    lineHeight: '1.5',
    whiteSpace: 'pre-wrap',
    wordWrap: 'normal',
    wordBreak: 'normal',
    tabSize: '2',
    hyphens: 'none',
    padding: '1em',
    margin: '0.5em 0',
    overflow: 'auto',
  },
  comment: { color: '#9a8f7a', fontStyle: 'italic' },
  prolog: { color: '#9a8f7a', fontStyle: 'italic' },
  doctype: { color: '#9a8f7a', fontStyle: 'italic' },
  cdata: { color: '#9a8f7a', fontStyle: 'italic' },
  punctuation: { color: '#6b5e50' },
  property: { color: '#8b6914' },
  tag: { color: '#8b6914' },
  boolean: { color: '#a05050' },
  number: { color: '#a05050' },
  constant: { color: '#a05050' },
  symbol: { color: '#a05050' },
  selector: { color: '#5c7a5c' },
  'attr-name': { color: '#5c7a5c' },
  string: { color: '#7a6b52' },
  char: { color: '#7a6b52' },
  builtin: { color: '#5c7a5c' },
  operator: { color: '#6b5e50' },
  entity: { color: '#8b6914' },
  url: { color: '#7a6b52' },
  atrule: { color: '#8b6914' },
  'attr-value': { color: '#7a6b52' },
  keyword: { color: '#8b6914' },
  regex: { color: '#a05050' },
  important: { color: '#8b6914', fontWeight: 'bold' },
  variable: { color: '#a05050' },
  function: { color: '#5c7a5c' },
  'class-name': { color: '#5c7a5c' },
};
import type {
  Message as IMessage,
  UserMessage,
  AgentMessage,
  WorkStep,
  ToolCall,
} from '/@/main/types/IMessage';
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
  pre: ({ children }) => {
    // Check if children is a code element with language- className
    if (
      React.isValidElement(children) &&
      children.props &&
      typeof children.props.className === 'string' &&
      children.props.className.startsWith('language-')
    ) {
      const language = children.props.className.replace('language-', '');
      const code = String(children.props.children).replace(/\n$/, '');
      return (
        <SyntaxHighlighter
          style={warmLight}
          language={language}
          PreTag="div"
          className={styles.markdownCodeBlock}
          wrapLongLines
        >
          {code}
        </SyntaxHighlighter>
      );
    }
    // Pure text code block (no language)
    if (
      React.isValidElement(children) &&
      children.props &&
      typeof children.props.className === 'undefined'
    ) {
      const code = String(children.props.children).replace(/\n$/, '');
      return (
        <SyntaxHighlighter
          style={warmLight}
          language="text"
          PreTag="div"
          className={styles.markdownCodeBlock}
          wrapLongLines
        >
          {code}
        </SyntaxHighlighter>
      );
    }
    return <pre className={styles.markdownCodeBlock}>{children}</pre>;
  },
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

/** 判断 result 是否为空或不可读 */
const isEmptyOrUnreadable = (value: string | undefined): boolean => {
  if (!value) return true;
  if (value === '[object Object]') return true;
  if (value === 'null') return true;
  if (value.trim() === '') return true;
  return false;
};

/** 从工具调用信息生成人类可读的操作描述 */
const getHumanReadableDescription = (toolCall: ToolCall): string => {
  const { name, arguments: args } = toolCall;

  // 尝试提取常见参数中的文件路径或搜索关键词
  const filePath = (args.file_path ?? args.filePath ?? args.path ?? args.filename) as string | undefined;
  const query = (args.query ?? args.search ?? args.pattern) as string | undefined;

  switch (name) {
    case 'read_file':
    case 'readFile':
      return filePath ? `正在读取文件: ${filePath}` : '正在读取文件';
    case 'write_file':
    case 'writeFile':
      return filePath ? `正在写入: ${filePath}` : '正在写入文件';
    case 'edit_file':
    case 'editFile':
    case 'apply_diff':
      return filePath ? `正在编辑: ${filePath}` : '正在编辑文件';
    case 'search':
    case 'grep':
    case 'find':
      return query ? `正在搜索: ${query}` : '正在搜索';
    case 'list_directory':
    case 'listFiles':
      return filePath ? `正在列出目录: ${filePath}` : '正在列出目录';
    default: {
      // 通用描述：显示操作名 + 关键参数
      const detail = filePath ?? query;
      return detail ? `${name}: ${detail}` : name;
    }
  }
};

interface ToolCallDetailsProps {
  toolCall: ToolCall;
}

const ToolCallDetails: FC<ToolCallDetailsProps> = React.memo(({ toolCall }) => {
  const { t } = useTranslation('llmbox');
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

  // 生成人类可读的摘要描述
  const description = getHumanReadableDescription(toolCall);

  // 判断 result 是否可展示
  const hasReadableResult = !isEmptyOrUnreadable(toolCall.result);

  return (
    <div className={styles.toolCall}>
      <button
        type="button"
        className={styles.toolCallHeader}
        onClick={toggleExpanded}
        onKeyDown={handleKeyDown}
        aria-expanded={isExpanded}
        aria-label={`Toggle details for ${toolCall.name}`}
      >
        <div className={styles.toolCallHeader__left}>
          <Wrench16Regular style={{ fontSize: 14, color: 'var(--warm-text-muted)' }} aria-hidden="true" />
          <span className={styles.toolCallHeader__name}>{description}</span>
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
          {hasReadableResult && (
            <div className={styles.toolCallResult}>{toolCall.result}</div>
          )}
          {!hasReadableResult && (
            <div className={styles.toolCallDescription}>
              {t('toolCallDescription', { defaultValue: '已执行操作' })}
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
  const { t } = useTranslation('llmbox');
  const renderStepIcon = () => {
    switch (step.type) {
      case 'thinking':
        return <Sparkle24Regular style={{ fontSize: 14 }} aria-hidden="true" />;
      case 'response':
        return <Chat20Regular style={{ fontSize: 14 }} aria-hidden="true" />;
      case 'tool_call':
        return <Wrench16Regular style={{ fontSize: 14 }} aria-hidden="true" />;
      case 'summary':
        if (step.isCompleted) {
          return (
            <CheckmarkCircle12Regular
              className={styles.statusIcon__completed}
              aria-label={t('completed')}
            />
          );
        }
        return (
          <ArrowClockwise12Regular
            className={styles.statusIcon__inProgress}
            aria-label={t('inProgress')}
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
        {step.type === 'thinking' && <span>{t('thinking')}</span>}
        {step.type === 'response' && <span>{t('response', { defaultValue: 'Response' })}</span>}
        {step.type === 'tool_call' && <span>{t('toolCall')}</span>}
        {step.type === 'summary' && <span>{t('summary')}</span>}
        {step.type === 'summary' && !step.isCompleted && (
          <div className={styles.streamingIndicator}>
            <div className={styles.streamingDots}>
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
            </div>
            <span className={styles.streamingText}>{t('generating')}</span>
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
    <div className={styles.userContent} style={{ whiteSpace: 'pre-wrap' }}>
      {message.content}
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
