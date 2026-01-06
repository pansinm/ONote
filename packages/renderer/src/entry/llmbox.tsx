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
import { LLM_BOX_MESSAGE_TYPES } from '../main/containers/LLMBox/constants';
import '../styles/index.scss';
import('github-markdown-css/github-markdown.css');

const { send, receive } = createChannel('MAIN_FRAME-LLM_BOX');

const MyChatComponent: React.FC = observer(() => {
  const settings = (window as any).__settings;
  const [store] = useState(
    () =>
      new LLMChatStore({
        apiKey: settings[LLM_API_KEY],
        model: settings[LLM_MODEL_NAME],
        apiBase: `${settings[LLM_BASE_URL]}/chat/completions`,
      }),
  );

  useEffect(() => {
    if (store.error) {
      alert(store.error);
    }
  }, [store.error]);

  useEffect(() => {
    console.log('[llmbox.tsx] Initial setup');

    const saveConversationHandler = async (fileUri: string, messages: any[]) => {
      try {
        console.log('[llmbox.tsx] Saving conversation:', { fileUri, messageCount: messages.length });
        await send({
          type: LLM_BOX_MESSAGE_TYPES.LLM_CONVERSATION_SAVE,
          data: { fileUri, messages },
        });
        console.log('[llmbox.tsx] Conversation save request sent');
      } catch (error) {
        console.error('[llmbox.tsx] Failed to save conversation:', error);
      }
    };

    console.log('[llmbox.tsx] Injecting saveConversationHandler');
    store.setSaveConversation(saveConversationHandler);

    const loadConversation = async (fileUri: string) => {
      try {
        console.log('[llmbox.tsx] Loading conversation for:', fileUri);
        const response = await send({
          type: LLM_BOX_MESSAGE_TYPES.LLM_CONVERSATION_LOAD,
          data: { fileUri },
        }) as { error?: string; messages?: any[] };

        console.log('[llmbox.tsx] LLM_CONVERSATION_LOAD response:', response);

        if (response.error) {
          console.error('[llmbox.tsx] Failed to load conversation:', response.error);
        } else {
          console.log('[llmbox.tsx] Setting messages:', response.messages?.length);
          store.setMessages(response.messages || []);
        }
      } catch (error) {
        console.error('[llmbox.tsx] Failed to load conversation:', error);
      }
    };

    receive(async ({ type, data }: any) => {
      console.log('[llmbox.tsx] Received message:', { type, data });

      if (type === LLM_BOX_MESSAGE_TYPES.EDITOR_FILE_OPEN && data?.uri) {
        console.log('[llmbox.tsx] Handling EDITOR_FILE_OPEN:', data.uri);
        store.updateFileUri(data.uri);
        store.setLoadConversation(loadConversation);
        await loadConversation(data.uri);
      }

      if (
        type === LLM_BOX_MESSAGE_TYPES.EDITOR_CONTENT_CHANGED ||
        type === LLM_BOX_MESSAGE_TYPES.EDITOR_SELECTION_CHANGED
      ) {
        store.updateEditorContent(data?.content || '', data?.selection || '');
      }
    });

    // 主动获取当前文件信息
    const getCurrentFileInfo = async () => {
      try {
        console.log('[llmbox.tsx] Requesting current file info');
        const response = await send({
          type: LLM_BOX_MESSAGE_TYPES.GET_CURRENT_FILE_INFO,
        }) as { fileUri?: string; rootUri?: string };

        console.log('[llmbox.tsx] Got current file info:', response);

        if (response.fileUri) {
          store.updateFileUri(response.fileUri);
          store.setLoadConversation(loadConversation);
          await loadConversation(response.fileUri);
        }
      } catch (error) {
        console.error('[llmbox.tsx] Failed to get current file info:', error);
      }
    };

    // 延迟执行，确保 bidc channel 已建立
    setTimeout(getCurrentFileInfo, 500);
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
