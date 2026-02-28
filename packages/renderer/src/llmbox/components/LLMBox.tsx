/**
 * 实现Agent组合，将相关组件进行合理布局
 * 1. 支持 style 和 className 属性
 * 2. 样式美观，符合项目整体风格
 */

import classNames from 'classnames';
import type { FC } from 'react';
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import Header from './Header';
import MessageList from './MessageList';
import type { MessageListRef } from './MessageList';
import InputArea from './InputArea';
import type { Message, UserMessage, AgentMessage } from '../types/IMessage';
import styles from './LLMBox.module.scss';
import type { IChannel } from '../ipc/constants';
import { useMainIpc } from '../ipc';
import { AgentStore } from '../stores/AgentStore';

export interface LLMBoxProps {
  className?: string;
  style?: React.CSSProperties;
  channel: IChannel;
}

// 生成唯一 ID
const generateId = (): string => {
  return `id-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

// ========== LLMBox 组件 ==========

const LLMBox: FC<LLMBoxProps> = observer(({ channel, className, style }) => {
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const agentStore = useMemo(() => new AgentStore(), []);
  const ipc = useMainIpc(channel);

  // Refs
  const messageListRef = useRef<MessageListRef>(null);

  // 初始滚动到底部
  useEffect(() => {
    messageListRef.current?.scrollToBottom('auto');
  }, []);

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
    messageListRef.current?.scrollToBottom('auto');
    setIsLoading(true);

    ipc.sendMessage(inputValue, async (event) => {
      agentStore.handleEvent(event);

      if (event.type === 'step-start' || event.type === 'step-delta' || event.type === 'step-complete') {
        const existingMessage = messages.find(
          (msg) => msg.id === agentStore.currentMessageId && msg.role === 'assistant',
        ) as AgentMessage;

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
  }, [inputValue, isLoading, agentStore, messages, ipc]);

  const handleClearQuote = useCallback(() => {
    // 当前没有实现引用功能，预留接口
  }, []);

  return (
    <div className={classNames(styles.container, className)} style={style}>
      <Header title="Agent" agentState={agentStore.agentState} className={styles.header} />
      <MessageList
        ref={messageListRef}
        messages={messages}
        className={styles.messageList}
      />
      <InputArea
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSend}
        onClearQuote={handleClearQuote}
        placeholder="输入消息... (Ctrl+Enter 发送)"
        disabled={isLoading}
        loading={isLoading}
        minRows={3}
        className={styles.inputArea}
      />
    </div>
  );
});

LLMBox.displayName = 'LLMBox';

export default LLMBox;
