import React from 'react';
import { observer } from 'mobx-react-lite';
import LLMBox from './LLMBox';
import stores from '../../stores';

const LLMBoxContainer = observer(() => {
  if (!stores.layoutStore.llmBoxVisible) {
    return null;
  }

  return <LLMBox style={{ height: '100%', width: '100%' }} />;
});

export default LLMBoxContainer;
