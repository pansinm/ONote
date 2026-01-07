import React, { useEffect, useRef } from 'react';
import { createChannel } from 'bidc';
import stores from '../../stores';
import { reaction } from 'mobx';
import {
  EDITOR_CONTENT_CHANGED,
  EDITOR_SELECTION_CHANGED,
} from '../../eventbus/EventName';
import { subscription } from '../../eventbus';
import { LLM_BOX_MESSAGE_TYPES } from './constants';
import {
  ConversationLoadHandler,
  ConversationSaveHandler,
} from './handlers/ConversationHandler';
import {
  AgentFileReadHandler,
  AgentFileWriteHandler,
  AgentFileCreateHandler,
  AgentFileDeleteHandler,
  AgentFileListHandler,
  AgentFileSearchHandler,
  AgentFileSearchInHandler,
} from './handlers/AgentFileHandler';
import {
  AgentContextLoadHandler,
  AgentContextSaveHandler,
} from './handlers/AgentContextHandler';
import {
  GetCurrentFileInfoHandler,
  AgentGetRootUriHandler,
  AgentGetActiveFileUriHandler,
} from './handlers/EditorEventHandler';

function LLMBoxFrame() {
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!ref.current?.contentWindow) {
      return;
    }

    const { send, receive } = createChannel(
      ref.current!.contentWindow!,
      'MAIN_FRAME-LLM_BOX',
    );

    const onote = (window as any).onote;

    const handlers: Record<string, any> = {
      [LLM_BOX_MESSAGE_TYPES.LLM_CONVERSATION_LOAD]:
        new ConversationLoadHandler(stores, onote),
      [LLM_BOX_MESSAGE_TYPES.LLM_CONVERSATION_SAVE]:
        new ConversationSaveHandler(stores, onote),
      [LLM_BOX_MESSAGE_TYPES.AGENT_FILE_READ]: new AgentFileReadHandler(stores),
      [LLM_BOX_MESSAGE_TYPES.AGENT_FILE_WRITE]: new AgentFileWriteHandler(
        stores,
      ),
      [LLM_BOX_MESSAGE_TYPES.AGENT_FILE_CREATE]: new AgentFileCreateHandler(
        stores,
      ),
      [LLM_BOX_MESSAGE_TYPES.AGENT_FILE_DELETE]: new AgentFileDeleteHandler(
        stores,
      ),
      [LLM_BOX_MESSAGE_TYPES.AGENT_FILE_LIST]: new AgentFileListHandler(stores),
      [LLM_BOX_MESSAGE_TYPES.AGENT_FILE_SEARCH]: new AgentFileSearchHandler(
        stores,
      ),
      [LLM_BOX_MESSAGE_TYPES.AGENT_FILE_SEARCH_IN]:
        new AgentFileSearchInHandler(stores),
      [LLM_BOX_MESSAGE_TYPES.AGENT_CONTEXT_LOAD]: new AgentContextLoadHandler(
        stores,
        onote,
      ),
      [LLM_BOX_MESSAGE_TYPES.AGENT_CONTEXT_SAVE]: new AgentContextSaveHandler(
        stores,
        onote,
      ),
      [LLM_BOX_MESSAGE_TYPES.GET_CURRENT_FILE_INFO]:
        new GetCurrentFileInfoHandler(stores),
      [LLM_BOX_MESSAGE_TYPES.AGENT_GET_ROOT_URI]: new AgentGetRootUriHandler(
        stores,
      ),
      [LLM_BOX_MESSAGE_TYPES.AGENT_GET_ACTIVE_FILE_URI]:
        new AgentGetActiveFileUriHandler(stores),
    };

    const contentChanged = subscription.subscribe(
      EDITOR_CONTENT_CHANGED,
      (data) => {
        send({
          type: LLM_BOX_MESSAGE_TYPES.EDITOR_CONTENT_CHANGED,
          data,
        });
      },
    );

    const selectionChanged = subscription.subscribe(
      EDITOR_SELECTION_CHANGED,
      (data) => {
        send({
          type: LLM_BOX_MESSAGE_TYPES.EDITOR_SELECTION_CHANGED,
          data,
        });
      },
    );

    const activeFileDisposer = reaction(
      () => stores.activationStore.activeFileUri,
      (uri) => {
        if (uri) {
          send({
            type: LLM_BOX_MESSAGE_TYPES.EDITOR_FILE_OPEN,
            data: { uri },
          });
        }
      },
    );

    receive(async ({ type, data }: any) => {
      const handler = handlers[type];
      if (!handler) {
        console.warn(`[LLMBoxFrame] No handler for type: ${type}`);
        return;
      }

      try {
        const result = await handler.handle(data);
        return result;
      } catch (error) {
        console.error(`[LLMBoxFrame] Handler error for ${type}:`, error);
        return {
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });

    return () => {
      contentChanged.dispose();
      selectionChanged.dispose();
      activeFileDisposer();
    };
  }, []);

  return (
    <iframe
      ref={ref}
      title="LLMBox"
      style={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        height: '100%',
        width: '100%',
      }}
      src={stores.layoutStore.sidebarUrl}
    />
  );
}

export default LLMBoxFrame;
