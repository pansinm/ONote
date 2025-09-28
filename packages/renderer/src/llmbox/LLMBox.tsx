import React from 'react';
import type { LLMBoxProps } from './types';
import ChatArea from './ChatArea';
import InputArea from './InputArea';
import styles from './LLMBox.module.scss';
import { observer } from 'mobx-react-lite';

const LLMBox: React.FC<LLMBoxProps> = ({ store }) => {
  return (
    <div className={styles.container}>
      <ChatArea messages={store.messages} isLoading={store.isLoading} />
      <InputArea
        selection={store.selection}
        onSendMessage={store.sendMessage}
        isLoading={store.isLoading}
      />
    </div>
  );
};

export default observer(LLMBox);
