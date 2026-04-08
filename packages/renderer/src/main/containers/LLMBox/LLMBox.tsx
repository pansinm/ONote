/**
 * 实现Agent组合，将相关组件进行合理布局
 * 1. 支持 style 和 className 属性
 * 2. 样式美观，符合项目整体风格
 */

import classNames from 'classnames';
import type { FC } from 'react';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';
import * as monaco from 'monaco-editor';
import MessageList from './MessageList';
import type { MessageListRef } from './MessageList';
import InputArea from './InputArea';
import type { Quote } from './InputArea';
import PendingChangesBar from './PendingChangesBar';
import type { Message, UserMessage, AgentMessage } from '/@/main/types/IMessage';
import styles from './LLMBox.module.scss';
import { assistant } from '../../assistant';
import stores from '../../stores';

export interface LLMBoxProps {
  className?: string;
  style?: React.CSSProperties;
}

// 生成唯一 ID
const generateId = (): string => {
  return `id-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

// ========== LLMBox 组件 ==========

const LLMBox: FC<LLMBoxProps> = observer(({ className, style }) => {
  const { t } = useTranslation('common');
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);

  const { agentStore } = stores;

  // Refs
  const messageListRef = useRef<MessageListRef>(null);
  // 用 ref 追踪最新 messages，避免 useCallback 闭包捕获陈旧值
  const messagesRef = useRef<Message[]>(messages);
  messagesRef.current = messages;

  // 初始滚动到底部
  useEffect(() => {
    messageListRef.current?.scrollToBottom('auto');
  }, []);

  // ========== Selection Quote：监听 Monaco editor 选中文字 ==========
  useEffect(() => {
    const editors = monaco.editor.getEditors();
    if (editors.length === 0) return;
    const editor = editors[0];

    const disposable = editor.onDidChangeCursorSelection(() => {
      if (agentStore.agentState !== 'idle') return;

      const selection = editor.getSelection();
      if (!selection || selection.isEmpty()) return;

      const model = editor.getModel();
      if (!model) return;

      const text = model.getValueInRange(selection);
      if (text && text.trim()) {
        setQuote({ id: `q-${Date.now()}`, content: text });
      }
    });

    return () => disposable.dispose();
  }, [agentStore.agentState]);

  // Handlers
  const handleSend = useCallback(() => {
    if (!inputValue.trim() || isLoading) {
      return;
    }

    const userMessage: UserMessage = {
      id: generateId(),
      role: 'user',
      content: inputValue,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setQuote(null);
    messageListRef.current?.scrollToBottom('auto');
    setIsLoading(true);

    const capturedInput = inputValue;

    assistant.chat(capturedInput, async (event) => {
      agentStore.handleEvent(event);

      if (event.type === 'step-start' || event.type === 'step-delta' || event.type === 'step-complete') {
        // 通过 ref 读取最新 messages，避免闭包陈旧值
        const currentMessages = messagesRef.current;
        const existingMessage = currentMessages.find(
          (msg) => msg.id === agentStore.currentMessageId && msg.role === 'assistant',
        ) as AgentMessage | undefined;

        if (event.type === 'step-start') {
          if (!existingMessage) {
            const newAgentMessage: AgentMessage = {
              id: agentStore.currentMessageId || generateId(),
              role: 'assistant',
              content: '',
              steps: [...agentStore.steps],
              isStreaming: true,
              timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, newAgentMessage]);
          } else {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === agentStore.currentMessageId && msg.role === 'assistant'
                  ? { ...msg, steps: [...agentStore.steps] }
                  : msg,
              ),
            );
          }
        } else {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === agentStore.currentMessageId && msg.role === 'assistant'
                ? { ...msg, steps: [...agentStore.steps] }
                : msg,
            ),
          );
        }

        messageListRef.current?.scrollToBottom('auto');
      }

      if (event.type === 'agent-complete' || event.type === 'agent-error') {
        setIsLoading(false);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === agentStore.currentMessageId && msg.role === 'assistant'
              ? { ...msg, isStreaming: false, steps: [...agentStore.steps] }
              : msg,
          ),
        );
      }
    });
  }, [inputValue, isLoading, agentStore]);

  return (
    <div className={classNames(styles.container, className)} style={style}>
      <PendingChangesBar />
      <MessageList
        ref={messageListRef}
        messages={messages}
        className={styles.messageList}
      />
      <InputArea
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSend}
        quote={quote ?? undefined}
        onClearQuote={() => setQuote(null)}
        placeholder={t('inputMessagePlaceholder')}
        disabled={isLoading}
        loading={isLoading}
        minRows={1}
        className={styles.inputArea}
        agentState={agentStore.agentState}
      />
    </div>
  );
});

LLMBox.displayName = 'LLMBox';

export default LLMBox;
