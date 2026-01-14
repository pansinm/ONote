import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { observer } from 'mobx-react-lite';

import AgentPanel from '../llmbox/components/AgentPanel';
import InputArea from '../llmbox/components/InputArea';
import { agentStore } from '../llmbox/store';
import {
  LLM_API_KEY,
  LLM_BASE_URL,
  LLM_MODEL_NAME,
} from '../common/constants/SettingKey';
import { LLM_BOX_MESSAGE_TYPES } from '../llmbox/constants/LLMBoxConstants';
import '../styles/index.scss';
import('github-markdown-css/github-markdown.css');
import { channel } from '../llmbox/ipc';

const { send, receive } = channel;

/**
 * LLMBoxApp组件 - 主应用组件，使用observer进行响应式包装
 * 该组件负责处理消息通信、管理代理状态和渲染UI界面
 */
const LLMBoxApp = observer(() => {
  // 使用useEffect设置消息处理和初始化
  useEffect(() => {
    // 定义消息处理函数
    const handleMessage = async ({ type, data }: any) => {
      // 处理获取当前文件信息的消息
      if (type === LLM_BOX_MESSAGE_TYPES.GET_CURRENT_FILE_INFO) {
        const { fileUri, rootUri } = data || {};
        // 如果有根URI，更新根URI
        if (rootUri) {
          agentStore.updateRootUri(rootUri);
        }
        // 如果有文件URI，更新文件URI并保存上下文
        if (fileUri) {
          agentStore.updateFileUri(fileUri);
          if (agentStore.fileUri) {
            await agentStore.saveContext(agentStore.fileUri);
          }
        }
      }

      // 处理编辑器文件打开的消息
      if (type === LLM_BOX_MESSAGE_TYPES.EDITOR_FILE_OPEN && data?.uri) {
        const newFileUri = data.uri;
        const newRootUri = data.rootUri;

        // 更新根URI（如果存在）
        if (newRootUri) {
          agentStore.updateRootUri(newRootUri);
        }

        // 更新文件URI并保存上下文
        agentStore.updateFileUri(newFileUri);
        if (agentStore.fileUri) {
          await agentStore.saveContext(agentStore.fileUri);
        }
      }

      // 处理编辑器内容或选择变化的消息
      if (
        type === LLM_BOX_MESSAGE_TYPES.EDITOR_CONTENT_CHANGED ||
        type === LLM_BOX_MESSAGE_TYPES.EDITOR_SELECTION_CHANGED
      ) {
        // 更新编辑器内容和选择
        agentStore.updateEditorContent(
          data?.content || '',
          data?.selection || '',
        );
      }
    };

    // 注册消息接收处理函数
    receive(handleMessage);

    // 发送获取当前文件信息的初始消息
    send({
      type: LLM_BOX_MESSAGE_TYPES.GET_CURRENT_FILE_INFO,
      data: undefined,
    });
  }, [agentStore]);

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
              await agentStore.runAgent(prompt);

              if (agentStore.fileUri) {
                await agentStore.saveContext(agentStore.fileUri);
              }
            } catch (error) {
              console.error('[llmbox.tsx] Failed to run agent:', error);
            }
          }}
          isLoading={agentStore.isRunning}
          selection={agentStore.selection}
        />
      </div>
    </div>
  );
});

const root = createRoot(document.getElementById('app') as HTMLDivElement);

window.addEventListener('onote:ready', () => {
  const settings = (window as any).__settings;
  agentStore.configure({
    apiKey: settings[LLM_API_KEY],
    model: settings[LLM_MODEL_NAME],
    apiBase: `${settings[LLM_BASE_URL]}/chat/completions`,
    maxIterations: 50,
    showThinking: true,
  });

  root.render(<LLMBoxApp />);
});
