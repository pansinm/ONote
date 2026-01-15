import React from 'react';
import type { ExecutionStep } from '../types';
import InputArea from './InputArea';
import styles from './LLMBox.module.scss';
import { observer } from 'mobx-react-lite';
import { isThinkingStep, isFinalAnswerStep, capitalize } from '../utils/formatters';

interface LLMBoxProps {
  steps: ExecutionStep[];
  isRunning: boolean;
  onSendMessage: (content: string) => Promise<void>;
  selection?: string;
}

export const LLMBox: React.FC<LLMBoxProps> = ({
  steps,
  isRunning,
  onSendMessage,
  selection,
}) => {
  const renderStepContent = (step: ExecutionStep) => {
    if (isThinkingStep(step)) {
      return <pre className={styles.stepContent}>{step.content}</pre>;
    }
    if (isFinalAnswerStep(step)) {
      return <pre className={styles.stepContent}>{step.content}</pre>;
    }
    return null;
  };

  return (
    <div className={styles.container}>
      <div className={styles.chatArea}>
        {steps.map((step) => (
          <div key={step.id} className={styles.step}>
            <span className={styles.stepType}>{capitalize(step.type)}</span>
            {renderStepContent(step)}
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
