import React from 'react';
import type { Message } from './types';
import MessageList from './MessageList';
import styles from './ChatArea.module.scss';

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
}

const ChatArea: React.FC<ChatAreaProps> = ({ messages, isLoading }) => {
  return (
    <div className={styles.chatArea}>
      <MessageList messages={messages} isLoading={isLoading} />
    </div>
  );
};

export default ChatArea;
