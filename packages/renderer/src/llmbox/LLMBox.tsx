import React from 'react';
import type { LLMBoxProps } from './types';
import ChatArea from './ChatArea';
import InputArea from './InputArea';
import styles from './LLMBox.module.scss';

const LLMBox: React.FC<LLMBoxProps> = ({
  onSendMessage,
  messages,
  isLoading,
}) => {
  return (
    <div className={styles.container}>
      <ChatArea messages={messages} isLoading={isLoading} />
      <InputArea onSendMessage={onSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default LLMBox;
