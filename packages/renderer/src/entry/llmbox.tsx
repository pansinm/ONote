import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { observer } from 'mobx-react-lite';
import { runInAction } from 'mobx';

import { LLMBox } from '../llmbox';
import { LLMChatStore } from '../llmbox/LLMChatStore';
import { AgentStore } from '../llmbox/AgentStore';
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

const LLMBoxApp = observer(() => {
  const settings = (window as any).__settings;
  const [mode, setMode] = useState<'chat' | 'agent'>('chat');
  
  // 初始化 Chat Store
  const [chatStore] = useState(
    () =>
      new LLMChatStore({
        apiKey: settings[LLM_API_KEY],
        model: settings[LLM_MODEL_NAME],
        apiBase: `${settings[LLM_BASE_URL]}/chat/completions`,
      }),
  );

  // 初始化 Agent Store
  const [agentStore] = useState(() =>
    new AgentStore(
      {
        apiKey: settings[LLM_API_KEY],
        model: settings[LLM_MODEL_NAME],
        apiBase: `${settings[LLM_BASE_URL]}/chat/completions`,
        maxIterations: 10,
        showThinking: true,
        timeout: 60000,
      },
      { send },
    ),
  );

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
    chatStore.setSaveConversation(saveConversationHandler);

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
          chatStore.setMessages(response.messages || []);
        }
      } catch (error) {
        console.error('[llmbox.tsx] Failed to load conversation:', error);
      }
    };

    const loadAgentContext = async (fileUri: string) => {
      try {
        console.log('[llmbox.tsx] Loading agent context for:', fileUri);
        const context = await agentStore.loadContext(fileUri);
        if (context) {
          console.log('[llmbox.tsx] Setting agent context:', context);
          agentStore.executionLog = context.executionLog || [];
          agentStore.error = context.error || null;
        }
      } catch (error) {
        console.error('[llmbox.tsx] Failed to load agent context:', error);
      }
    };

    receive(async ({ type, data }: any) => {
      console.log('[llmbox.tsx] Received message:', { type, data });

      if (type === LLM_BOX_MESSAGE_TYPES.EDITOR_FILE_OPEN && data?.uri) {
        console.log('[llmbox.tsx] Handling EDITOR_FILE_OPEN:', data.uri);
        chatStore.updateFileUri(data.uri);
        agentStore.updateFileUri(data.uri);
        chatStore.setLoadConversation(loadConversation);
        await loadConversation(data.uri);
      }

      if (
        type === LLM_BOX_MESSAGE_TYPES.EDITOR_CONTENT_CHANGED ||
        type === LLM_BOX_MESSAGE_TYPES.EDITOR_SELECTION_CHANGED
      ) {
        chatStore.updateEditorContent(data?.content || '', data?.selection || '');
        agentStore.updateEditorContent(data?.content || '', data?.selection || '');
      }
    });

    const getCurrentFileInfo = async () => {
      try {
        console.log('[llmbox.tsx] Requesting current file info');
        const response = await send({
          type: LLM_BOX_MESSAGE_TYPES.GET_CURRENT_FILE_INFO,
        }) as { fileUri?: string; rootUri?: string };

        console.log('[llmbox.tsx] Got current file info:', response);

        if (response.fileUri) {
          chatStore.updateFileUri(response.fileUri);
          agentStore.updateFileUri(response.fileUri);
          chatStore.setLoadConversation(loadConversation);
          await loadConversation(response.fileUri);
        }
      } catch (error) {
        console.error('[llmbox.tsx] Failed to get current file info:', error);
      }
    };

    setTimeout(getCurrentFileInfo, 500);
  }, [chatStore, agentStore]);

  useEffect(() => {
    if (mode === 'agent' && agentStore.fileUri) {
      const fileUri = agentStore.fileUri;
      const loadAgentContext = async () => {
        try {
          console.log('[llmbox.tsx] Loading agent context for:', fileUri);
          const context = await agentStore.loadContext(fileUri);
          if (context) {
            console.log('[llmbox.tsx] Setting agent context:', context);
            runInAction(() => {
              agentStore.executionLog = context.executionLog || [];
              agentStore.error = context.error || null;
            });
          }
        } catch (error) {
          console.error('[llmbox.tsx] Failed to load agent context:', error);
        }
      };
      loadAgentContext();
    }
  }, [mode]);

  const handleAgentRun = async (prompt: string) => {
    try {
      await agentStore.runAgent(prompt);

      if (agentStore.fileUri) {
        await agentStore.saveContext({
          fileUri: agentStore.fileUri,
          executionLog: agentStore.executionLog,
          error: agentStore.error,
          content: agentStore.content,
          selection: agentStore.selection,
        });
      }
    } catch (error) {
      console.error('[llmbox.tsx] Failed to run agent:', error);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 模式切换 */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        padding: '12px 16px',
        background: '#ffffff',
        borderBottom: '1px solid #e0e0e0'
      }}>
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
            fontWeight: '500'
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
            fontWeight: '500'
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
          <div className="agent-mode" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              {(() => {
                const AgentPanelModule = require('../llmbox/AgentPanel');
                const AgentPanel = AgentPanelModule.default;
                return <AgentPanel store={agentStore} />;
              })()}
            </div>
            <div style={{ 
              padding: '12px 16px', 
              background: '#ffffff',
              borderTop: '1px solid #e0e0e0'
            }}>
              <textarea
                placeholder="Enter a task for the agent..."
                disabled={agentStore.isRunning}
                style={{
                  width: '100%',
                  minHeight: '60px',
                  maxHeight: '150px',
                  padding: '12px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  fontSize: '14px'
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    const textarea = e.target as HTMLTextAreaElement;
                    if (textarea.value.trim()) {
                      handleAgentRun(textarea.value);
                      textarea.value = '';
                    }
                  }
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                {agentStore.isRunning ? (
                  <button
                    onClick={() => agentStore.stopAgent()}
                    style={{
                      padding: '8px 16px',
                      background: '#ff5722',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    ⏹️ Stop
                  </button>
                ) : (
                  <button
                    disabled={agentStore.isRunning}
                    onClick={() => {
                      const textarea = document.querySelector(
                        '.agent-mode textarea',
                      ) as HTMLTextAreaElement;
                      if (textarea?.value.trim()) {
                        handleAgentRun(textarea.value);
                        textarea.value = '';
                      }
                    }}
                    style={{
                      padding: '8px 16px',
                      background: '#28a745',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: agentStore.isRunning ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      opacity: agentStore.isRunning ? 0.6 : 1
                    }}
                  >
                    🚀 Run Agent
                  </button>
                )}
              </div>
            </div>
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
