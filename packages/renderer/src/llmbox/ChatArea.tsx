import React, { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import type { Message } from './types';
import MessageList from './MessageList';
import styles from './ChatArea.module.scss';

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
}

const ChatArea: React.FC<ChatAreaProps> = ({ messages, isLoading }) => {
  const chatAreaRef = useRef<HTMLDivElement>(null);

  const isUserScrollingRef = useRef(false);

  // 自动滚动到底部
  const scrollToBottom = () => {
    if (!isUserScrollingRef.current && chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // 用户手动滚动时暂停自动滚动
  const handleScroll = () => {
    const element = chatAreaRef.current;
    if (element) {
      const isAtBottom =
        element.scrollHeight - element.scrollTop <= element.clientHeight + 10;
      isUserScrollingRef.current = !isAtBottom;
    }
  };

  return (
    <div ref={chatAreaRef} className={styles.chatArea} onScroll={handleScroll}>
      <MessageList messages={messages} isLoading={isLoading} />
    </div>
  );
};

export default observer(ChatArea);
