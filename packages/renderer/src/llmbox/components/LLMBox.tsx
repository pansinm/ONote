import React from 'react';
import type { ExecutionStep } from '../types';
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
            {'content' in step && <pre className={styles.stepContent}>{(step as any).content}</pre>}
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
