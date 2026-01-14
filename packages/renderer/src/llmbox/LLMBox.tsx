import React from 'react';
import type { ExecutionStep } from './core/types';
import InputArea from './InputArea';
import styles from './LLMBox.module.scss';
import { observer } from 'mobx-react-lite';

interface LLMBoxProps {
  executionLog: ExecutionStep[];
  isRunning: boolean;
  onSendMessage: (content: string) => Promise<void>;
  selection?: string;
}

export const LLMBox: React.FC<LLMBoxProps> = ({
  executionLog,
  isRunning,
  onSendMessage,
  selection,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.chatArea}>
        {executionLog.map((step) => (
          <div key={step.id} className={styles.step}>
            <span className={styles.stepType}>{step.type}</span>
            <pre className={styles.stepContent}>{step.content}</pre>
          </div>
        ))}
        {isRunning && <div className={styles.loading}>Running...</div>}
      </div>
      <InputArea
        selection={selection}
        onSendMessage={onSendMessage}
        isLoading={isRunning}
      />
    </div>
  );
};

export default observer(LLMBox);
