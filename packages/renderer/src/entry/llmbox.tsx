import React, { useCallback, useEffect, useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { observer } from 'mobx-react-lite';

import { LLMBox } from '../llmbox';
import { LLMChatStore } from '../llmbox/LLMChatStore';
import { AgentStore } from '../llmbox/AgentStore';
import InputArea from '../llmbox/InputArea';
import {
  LLM_API_KEY,
  LLM_BASE_URL,
  LLM_MODEL_NAME,
} from '../common/constants/SettingKey';
import { createChannel } from 'bidc';
import { LLM_BOX_MESSAGE_TYPES } from '../llmbox/constants/LLMBoxConstants';
import '../styles/index.scss';
import('github-markdown-css/github-markdown.css');

const { send, receive } = createChannel('MAIN_FRAME-LLM_BOX');

const LLMBoxApp = observer(() => {
  const settings = (window as any).__settings;
  const [mode, setMode] = useState<'chat' | 'agent'>('agent');

  const previousFileUriRef = useRef<string | null>(null);

  const [chatStore] = useState(
    () =>
      new LLMChatStore({
        apiKey: settings[LLM_API_KEY],
        model: settings[LLM_MODEL_NAME],
        apiBase: `${settings[LLM_BASE_URL]}/chat/completions`,
      }),
  );

  const [agentStore] = useState(
    () =>
      new AgentStore(
        {
          apiKey: settings[LLM_API_KEY],
          model: settings[LLM_MODEL_NAME],
          apiBase: `${settings[LLM_BASE_URL]}/chat/completions`,
          maxIterations: 50,
          showThinking: true,
          timeout: 60000,
        },
        { send },
      ),
  );

  const saveAgentContextHandler = useCallback(
    async (fileUri: string) => {
      try {
        console.log('[llmbox.tsx] Saving agent context:', {
          fileUri,
          stepCount: agentStore.executionLog.length,
        });
        await agentStore.saveContext(fileUri);
        console.log('[llmbox.tsx] Agent context saved');
      } catch (error) {
        console.error('[llmbox.tsx] Failed to save agent context:', error);
      }
    },
    [agentStore],
  );

  const loadAgentContextHandler = useCallback(
    async (fileUri: string) => {
      try {
        console.log('[llmbox.tsx] Loading agent context for:', fileUri);
        const context = await agentStore.loadContext(fileUri);
        if (context) {
          console.log('[llmbox.tsx] Agent context loaded:', context);
        }
      } catch (error) {
        console.error('[llmbox.tsx] Failed to load agent context:', error);
      }
    },
    [agentStore],
  );

  const loadConversation = useCallback(
    async (fileUri: string) => {
      try {
        console.log('[llmbox.tsx] Loading conversation for:', fileUri);
        const response = (await send({
          type: LLM_BOX_MESSAGE_TYPES.LLM_CONVERSATION_LOAD,
          data: { fileUri },
        })) as { error?: string; messages?: any[] };

        console.log('[llmbox.tsx] LLM_CONVERSATION_LOAD response:', response);

        if (response.error) {
          console.error(
            '[llmbox.tsx] Failed to load conversation:',
            response.error,
          );
        } else {
          console.log(
            '[llmbox.tsx] Setting messages:',
            response.messages?.length,
          );
          chatStore.setMessages(response.messages || []);
        }
      } catch (error) {
        console.error('[llmbox.tsx] Failed to load conversation:', error);
      }
    },
    [chatStore],
  );

  const handleFileChange = useCallback(
    async (fileUri: string) => {
      if (
        previousFileUriRef.current &&
        previousFileUriRef.current !== fileUri
      ) {
        console.log(
          '[llmbox.tsx] File changed, saving agent context for:',
          previousFileUriRef.current,
        );
        await saveAgentContextHandler(previousFileUriRef.current);
      }

      console.log('[llmbox.tsx] Loading agent context for new file:', fileUri);
      await loadAgentContextHandler(fileUri);

      previousFileUriRef.current = fileUri;
    },
    [saveAgentContextHandler, loadAgentContextHandler],
  );

  useEffect(() => {
    console.log('[llmbox.tsx] Initial setup');

    const saveConversationHandler = async (
      fileUri: string,
      messages: any[],
    ) => {
      try {
        console.log('[llmbox.tsx] Saving conversation:', {
          fileUri,
          messageCount: messages.length,
        });
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
    chatStore.setSaveConversation(saveConversationHandler);

    receive(async ({ type, data }: any) => {
      console.log('[llmbox.tsx] Received message:', { type, data });

      if (type === LLM_BOX_MESSAGE_TYPES.GET_CURRENT_FILE_INFO) {
        const { fileUri, rootUri } = data;
        console.log('[llmbox.tsx] Got file info:', { fileUri, rootUri });
        if (rootUri) {
          agentStore.updateRootUri(rootUri);
        }
        if (fileUri) {
          chatStore.updateFileUri(fileUri);
          agentStore.updateFileUri(fileUri);
          chatStore.setLoadConversation(loadConversation);

          await loadConversation(fileUri);
          await handleFileChange(fileUri);
        }
      }

      if (type === LLM_BOX_MESSAGE_TYPES.EDITOR_FILE_OPEN && data?.uri) {
        console.log('[llmbox.tsx] Handling EDITOR_FILE_OPEN:', data.uri);
        const newFileUri = data.uri;
        const newRootUri = data.rootUri;

        if (newRootUri) {
          agentStore.updateRootUri(newRootUri);
        }

        chatStore.updateFileUri(newFileUri);
        agentStore.updateFileUri(newFileUri);
        chatStore.setLoadConversation(loadConversation);

        await loadConversation(newFileUri);
        await handleFileChange(newFileUri);
      }

      if (
        type === LLM_BOX_MESSAGE_TYPES.EDITOR_CONTENT_CHANGED ||
        type === LLM_BOX_MESSAGE_TYPES.EDITOR_SELECTION_CHANGED
      ) {
        chatStore.updateEditorContent(
          data?.content || '',
          data?.selection || '',
        );
        agentStore.updateEditorContent(
          data?.content || '',
          data?.selection || '',
        );
      }
    });

    const getCurrentFileInfo = async () => {
      try {
        console.log('[llmbox.tsx] Requesting current file info');
        const response = (await send({
          type: LLM_BOX_MESSAGE_TYPES.GET_CURRENT_FILE_INFO,
        })) as { fileUri?: string; rootUri?: string };

        console.log('[llmbox.tsx] Got current file info:', response);

        if (response.fileUri) {
          const newFileUri = response.fileUri;
          chatStore.updateFileUri(newFileUri);
          agentStore.updateFileUri(newFileUri);
          chatStore.setLoadConversation(loadConversation);

          await loadConversation(newFileUri);
          await handleFileChange(newFileUri);
        }
      } catch (error) {
        console.error('[llmbox.tsx] Failed to get current file info:', error);
      }
    };

    setTimeout(getCurrentFileInfo, 500);
  }, [chatStore, agentStore, handleFileChange, loadConversation]);

  useEffect(() => {
    if (mode === 'agent' && agentStore.fileUri) {
      const fileUri = agentStore.fileUri;
      loadAgentContextHandler(fileUri);
    }
  }, [mode, agentStore.fileUri, loadAgentContextHandler]);

  const handleAgentRun = async (prompt: string) => {
    try {
      await agentStore.runAgent(prompt);

      if (agentStore.fileUri) {
        await saveAgentContextHandler(agentStore.fileUri);
      }
    } catch (error) {
      console.error('[llmbox.tsx] Failed to run agent:', error);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 模式切换 */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          padding: '12px 16px',
          background: '#ffffff',
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <button
          style={{
            flex: 1,
            padding: '8px 16px',
            border: '1px solid #e0e0e0',
            borderRadius: '6px',
            background: mode === 'chat' ? '#007bff' : '#f5f5f5',
            color: mode === 'chat' ? '#ffffff' : '#333333',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
          }}
          onClick={() => setMode('chat')}
        >
          💬 Chat
        </button>
        <button
          style={{
            flex: 1,
            padding: '8px 16px',
            border: '1px solid #e0e0e0',
            borderRadius: '6px',
            background: mode === 'agent' ? '#007bff' : '#f5f5f5',
            color: mode === 'agent' ? '#ffffff' : '#333333',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
          }}
          onClick={() => setMode('agent')}
        >
          🤖 Agent
        </button>
      </div>

      {/* 内容区域 */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {mode === 'chat' ? (
          <LLMBox store={chatStore} />
        ) : (
          <div
            className="agent-mode"
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ flex: 1, overflow: 'hidden' }}>
              {(() => {
                const AgentPanelModule = require('../llmbox/AgentPanel');
                const AgentPanel = AgentPanelModule.default;
                return <AgentPanel store={agentStore} />;
              })()}
            </div>
            <InputArea
              onSendMessage={async (content, imageUrls) => {
                if (content.trim()) {
                  await handleAgentRun(content);
                }
              }}
              isLoading={agentStore.isRunning}
              selection={agentStore.selection}
            />
          </div>
        )}
      </div>
    </div>
  );
});

const root = createRoot(document.getElementById('app') as HTMLDivElement);

window.addEventListener('onote:ready', () => {
  root.render(<LLMBoxApp />);
});
