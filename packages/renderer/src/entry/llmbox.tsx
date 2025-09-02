import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';

import { LLMBox, useLLMChat } from '../llmbox';
import {
  LLM_API_KEY,
  LLM_BASE_URL,
  LLM_MODEL_NAME,
} from '../common/constants/SettingKey';

const MyChatComponent: React.FC = () => {
  const settings = (window as any).__settings;
  const { messages, isLoading, error, sendMessage } = useLLMChat({
    apiKey: settings[LLM_API_KEY], // 必填
    model: settings[LLM_MODEL_NAME], // 可选，默认为gpt-3.5-turbo
    apiBase: `${settings[LLM_BASE_URL]}/chat/completions`, // 可选，支持自定义API端点
  });

  useEffect(() => {
    if (error) {
      alert(error);
    }
  }, [error]);

  return (
    <div style={{ height: '100vh' }}>
      <LLMBox
        onSendMessage={sendMessage}
        messages={messages}
        isLoading={isLoading}
      />
    </div>
  );
};

const root = createRoot(document.getElementById('app') as HTMLDivElement);

window.addEventListener('onote:ready', () => {
  root.render(<MyChatComponent />);
});
