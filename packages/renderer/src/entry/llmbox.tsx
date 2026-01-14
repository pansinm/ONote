import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { observer } from 'mobx-react-lite';

import AgentPanel from '../llmbox/components/AgentPanel';
import InputArea from '../llmbox/components/InputArea';
import { AgentStore } from '../llmbox/store/AgentStore';
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

  const [agentStore] = React.useState(
    () =>
      new AgentStore(
        {
          apiKey: settings[LLM_API_KEY],
          model: settings[LLM_MODEL_NAME],
          apiBase: `${settings[LLM_BASE_URL]}/chat/completions`,
          maxIterations: 50,
          showThinking: true,
        },
        { send },
      ),
  );

  useEffect(() => {
    const handleMessage = async ({ type, data }: any) => {
      if (type === LLM_BOX_MESSAGE_TYPES.GET_CURRENT_FILE_INFO) {
        const { fileUri, rootUri } = data || {};
        if (rootUri) {
          agentStore.updateRootUri(rootUri);
        }
        if (fileUri) {
          agentStore.updateFileUri(fileUri);
          if (agentStore.fileUri) {
            await agentStore.saveContext(agentStore.fileUri);
          }
        }
      }

      if (type === LLM_BOX_MESSAGE_TYPES.EDITOR_FILE_OPEN && data?.uri) {
        const newFileUri = data.uri;
        const newRootUri = data.rootUri;

        if (newRootUri) {
          agentStore.updateRootUri(newRootUri);
        }

        agentStore.updateFileUri(newFileUri);
        if (agentStore.fileUri) {
          await agentStore.saveContext(agentStore.fileUri);
        }
      }

      if (
        type === LLM_BOX_MESSAGE_TYPES.EDITOR_CONTENT_CHANGED ||
        type === LLM_BOX_MESSAGE_TYPES.EDITOR_SELECTION_CHANGED
      ) {
        agentStore.updateEditorContent(
          data?.content || '',
          data?.selection || '',
        );
      }
    };

    receive(handleMessage);

    send({ type: LLM_BOX_MESSAGE_TYPES.GET_CURRENT_FILE_INFO, data: undefined });
  }, [agentStore]);

  const handleAgentRun = async (prompt: string) => {
    try {
      await agentStore.runAgent(prompt);

      if (agentStore.fileUri) {
        await agentStore.saveContext(agentStore.fileUri);
      }
    } catch (error) {
      console.error('[llmbox.tsx] Failed to run agent:', error);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AgentPanel store={agentStore} />
      <div style={{ padding: '10px 15px', borderTop: '1px solid var(--border-color)' }}>
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
  root.render(<LLMBoxApp />);
});
