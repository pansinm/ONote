import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { observer } from 'mobx-react-lite';

import AgentPanel from '../llmbox/components/AgentPanel';
import InputArea from '../llmbox/components/InputArea';
import { store as agentStore } from '../llmbox/store';
import { getAgent } from '../llmbox/agent';
import {
  LLM_BOX_MESSAGE_TYPES,
  type LLMBoxMessageType,
} from '../llmbox/utils/constants';
import '../styles/index.scss';
import('github-markdown-css/github-markdown.css');
import { channel } from '../llmbox/ipc';

/**
 * LLMBoxApp组件 - 主应用组件，使用observer进行响应式包装
 * 该组件负责处理消息通信、管理代理状态和渲染UI界面
 */
const LLMBoxApp = observer(() => {
  // 使用useEffect设置消息处理和初始化
  useEffect(() => {
    // 发送获取当前文件信息的初始消息
    channel
      .send({
        type: LLM_BOX_MESSAGE_TYPES.GET_CURRENT_FILE_INFO,
        data: undefined,
      })
      .then(({ fileUri, rootUri }) => {
        agentStore.updateFileUri(fileUri);
        agentStore.updateRootUri(rootUri);
      });
  }, [agentStore]);

  channel.receive(async (message) => {
    if (!message || typeof message !== 'object') return;

    const msg = message as {
      type: LLMBoxMessageType;
      data: unknown;
    };

    switch (msg.type) {
      case LLM_BOX_MESSAGE_TYPES.EDITOR_CONTENT_CHANGED: {
        const data = msg.data as { content: string; selection: string };
        agentStore.updateEditorContent(data.content, data.selection);
        break;
      }

      case LLM_BOX_MESSAGE_TYPES.EDITOR_SELECTION_CHANGED: {
        const data = msg.data as { selection: string };
        agentStore.updateEditorContent(agentStore.content, data.selection);
        break;
      }

      case LLM_BOX_MESSAGE_TYPES.EDITOR_FILE_OPEN: {
        const data = msg.data as { uri: string; rootUri: string };
        agentStore.updateFileUri(data.uri);
        agentStore.updateRootUri(data.rootUri);
        break;
      }

      default:
        // Log unknown message types for debugging
        console.debug('[LLMBox] Unknown message type:', msg.type);
    }
  });

  // 返回组件的JSX结构
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 渲染代理面板 */}
      <AgentPanel store={agentStore} />
      {/* 渲染输入区域 */}
      <div
        style={{
          padding: '10px 15px',
          borderTop: '1px solid var(--border-color)',
        }}
      >
        <InputArea
          onSendMessage={async (prompt) => {
            try {
              await getAgent().run(prompt);
            } catch (error) {
              console.error('[llmbox.tsx] Failed to run agent:', error);
            }
          }}
          isLoading={agentStore.isRunning}
          selection={agentStore.selection}
          onClearSelection={() => {
            agentStore.updateEditorContent(agentStore.content, '');
          }}
        />
      </div>
    </div>
  );
});

const root = createRoot(document.getElementById('app') as HTMLDivElement);

window.addEventListener('onote:ready', () => {
  root.render(<LLMBoxApp />);
});
