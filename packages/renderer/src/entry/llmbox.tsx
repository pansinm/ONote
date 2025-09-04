import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { observer } from 'mobx-react-lite';

import { LLMBox } from '../llmbox';
import { LLMChatStore } from '../llmbox/LLMChatStore';
import {
  LLM_API_KEY,
  LLM_BASE_URL,
  LLM_MODEL_NAME,
} from '../common/constants/SettingKey';
import { createChannel } from 'bidc';
import {
  EDITOR_CONTENT_CHANGED,
  EDITOR_SELECTION_CHANGED,
} from '../main/eventbus/EventName';
import '../styles/index.scss';
import('github-markdown-css/github-markdown.css');

const { send, receive } = createChannel('MAIN_FRAME-LLM_BOX');

const MyChatComponent: React.FC = observer(() => {
  const settings = (window as any).__settings;
  const [store] = useState(
    () =>
      new LLMChatStore({
        apiKey: settings[LLM_API_KEY], // 必填
        model: settings[LLM_MODEL_NAME], // 可选，默认为gpt-3.5-turbo
        apiBase: `${settings[LLM_BASE_URL]}/chat/completions`, // 可选，支持自定义API端点
      }),
  );

  useEffect(() => {
    if (store.error) {
      alert(store.error);
    }
  }, [store.error]);

  useEffect(() => {
    receive(async ({ type, data }: any) => {
      if (
        type === EDITOR_SELECTION_CHANGED ||
        type === EDITOR_CONTENT_CHANGED
      ) {
        store.updateEditorContent(data?.content || '', data?.selection || '');
      }
    });
  }, [store]);

  return (
    <div style={{ height: '100vh' }}>
      <LLMBox store={store} />
    </div>
  );
});

const root = createRoot(document.getElementById('app') as HTMLDivElement);

window.addEventListener('onote:ready', () => {
  root.render(<MyChatComponent />);
});
