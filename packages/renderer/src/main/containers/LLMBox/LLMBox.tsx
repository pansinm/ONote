/**
 * AI 写作伙伴
 * 1. 支持 style 和 className 属性
 * 2. 样式美观，符合项目整体风格
 * 3. 欢迎页展示 AI 助手的个性和核心能力
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
  const { t: tLlm } = useTranslation('llmbox');
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

  // Core send logic — extracted so both handleSend and handleQuickPrompt reuse it
  const sendMessage = useCallback((text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: UserMessage = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuote(null);
    messageListRef.current?.scrollToBottom('auto');
    setIsLoading(true);

    assistant.chat(text, async (event) => {
      agentStore.handleEvent(event);

      if (event.type === 'step-start' || event.type === 'step-delta' || event.type === 'step-complete') {
        if (event.type === 'step-start') {
          const exists = messagesRef.current.some(
            (msg) => msg.id === agentStore.currentMessageId && msg.role === 'assistant',
          );
          if (!exists) {
            const newMsg: AgentMessage = {
              id: agentStore.currentMessageId || generateId(),
              role: 'assistant',
              content: '',
              steps: [...agentStore.steps],
              isStreaming: true,
              timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, newMsg]);
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
  }, [isLoading, agentStore]);

  const handleSend = useCallback(() => {
    sendMessage(inputValue);
    setInputValue('');
  }, [inputValue, sendMessage]);

  // Quick prompt — directly sends without going through inputValue
  const handleQuickPrompt = useCallback((prompt: string) => {
    sendMessage(prompt);
  }, [sendMessage]);

  return (
    <div className={classNames(styles.container, className)} style={style}>
      <div className={styles.pendingBar}>
        <PendingChangesBar />
      </div>
      {messages.length === 0 ? (
        <div className={styles.welcomePanel}>
          <div className={styles.welcomeDroplet}>✦</div>
          <div className={styles.welcomeGreeting}>{tLlm('welcomeGreeting')}</div>
          <div className={styles.welcomeTagline}>{tLlm('welcomeTagline')}</div>
          <div className={styles.quickPrompts}>
            {[tLlm('quickPrompt1'), tLlm('quickPrompt2'), tLlm('quickPrompt3')].map((prompt) => (
              <button
                key={prompt}
                type="button"
                className={styles.quickPrompt}
                onClick={() => handleQuickPrompt(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>
          <div className={styles.welcomeHint}>{tLlm('welcomeHint')}</div>
        </div>
      ) : (
        <MessageList
          ref={messageListRef}
          messages={messages}
          className={styles.messageList}
        />
      )}
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
