/**
 * Agent输入区域组件
 * 1. 多行输入框（自动增高）+ 工具条
 * 2. 输入框跟工具条上下布局
 * 3. 工具条包含状态指示器和发送按钮
 * 4. 支持引用属性，引用的文本展示在输入框上方，绝对定位。
 * 5. 引用文本带x按钮，可关闭
 * 6. 组件为受控组件
 * 7. 样式符合项目整体风格
 */

import classNames from 'classnames';
import type { FC } from 'react';
import React, { useRef, useCallback } from 'react';
import { Button } from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import {
  SendRegular,
  DismissRegular,
  ArrowClockwiseRegular,
} from '@fluentui/react-icons';
import styles from './InputArea.module.scss';

const MAX_HEIGHT = 200;

export interface Quote {
  id: string;
  content: string;
  source?: string;
}

export interface InputAreaProps {
  // 输入框的值
  value: string;

  // 值变化回调
  onChange: (value: string) => void;

  // 发送按钮点击回调
  onSend: () => void;

  // 引用内容（可选）
  quote?: Quote;

  // 清除引用回调
  onClearQuote?: () => void;

  // 占位符文本
  placeholder?: string;

  // 是否禁用
  disabled?: boolean;

  // 是否正在发送（用于显示加载状态）
  loading?: boolean;

  // 最小行数（初始高度）
  minRows?: number;

  // 自定义容器类名（用于外部样式覆盖）
  className?: string;

  // 自定义容器样式（用于外部样式定义）
  style?: React.CSSProperties;

  // Agent 状态
  agentState?: 'idle' | 'thinking' | 'executing';
}

const InputArea: FC<InputAreaProps> = (props) => {
  const {
    value,
    onChange,
    onSend,
    quote,
    onClearQuote,
    placeholder,
    disabled = false,
    loading = false,
    minRows = 1,
    className,
    style,
    agentState = 'idle',
  } = props;

  const { t } = useTranslation('llmbox');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow: 根据内容自动调整高度
  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const el = e.target;
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, MAX_HEIGHT) + 'px';
      onChange(el.value);
    },
    [onChange],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled && !loading) {
        onSend();
      }
    }
  };

  const canSend = value.trim() && !disabled && !loading;

  return (
    <div
      className={classNames(styles.inputArea, className)}
      style={style}
    >
      {/* 引用区域 */}
      {quote && (
        <div className={styles.quoteArea}>
          <div className={styles.quoteContent}>
            {quote.source && <span className={styles.quoteSource}>{quote.source}</span>}
            <span className={styles.quoteText}>
              {quote.content.length > 100
                ? `${quote.content.slice(0, 100)}...`
                : quote.content}
            </span>
          </div>
          {onClearQuote && (
            <button
              className={styles.quoteClose}
              onClick={onClearQuote}
              aria-label={t('clearQuote')}
              type="button"
            >
              <DismissRegular />
            </button>
          )}
        </div>
      )}

      {/* 输入框 */}
      <textarea
        ref={textareaRef}
        className={styles.textarea}
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || t('inputPlaceholder')}
        disabled={disabled}
        rows={minRows}
      />

      {/* 工具条 */}
      <div className={styles.toolbar}>
        {agentState !== 'idle' && (
          <span
            className={classNames(styles.statusDot, styles.statusDotActive)}
          />
        )}
        <div style={{ flex: 1 }} />
        <Button
          className={styles.sendButton}
          appearance="primary"
          disabled={!canSend}
          onClick={onSend}
          icon={loading ? <ArrowClockwiseRegular /> : <SendRegular />}
        />
      </div>
    </div>
  );
};

export default InputArea;
