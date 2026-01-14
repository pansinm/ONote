import React, { useRef, useEffect } from 'react';
import { HandlerRegistry } from './handlers/HandlerRegistry';
import { createChannel } from 'bidc';
import stores from '../../stores';
import { reaction } from 'mobx';
import {
  EDITOR_CONTENT_CHANGED,
  EDITOR_SELECTION_CHANGED,
} from '../../eventbus/EventName';
import { subscription } from '../../eventbus';
import { LLM_BOX_MESSAGE_TYPES } from '../../../llmbox/constants/LLMBoxConstants';
import {
  ConversationLoadHandler,
  ConversationSaveHandler,
} from './handlers/ConversationHandler';
import {
  AgentFileReadHandler,
  AgentFileWriteHandler,
  AgentFileReplaceHandler,
  AgentFileCreateHandler,
  AgentFileDeleteHandler,
  AgentFileListHandler,
  AgentFileSearchHandler,
  AgentFileSearchInHandler,
} from './handlers/AgentFileHandler';
import {
  AgentContextLoadHandler,
  AgentContextSaveHandler,
  AgentExecutionStateLoadHandler,
  AgentExecutionStateSaveHandler,
  AgentExecutionStateDeleteHandler,
} from './handlers/AgentContextHandler';
import {
  GetCurrentFileInfoHandler,
  AgentGetRootUriHandler,
  AgentGetActiveFileUriHandler,
} from './handlers/EditorEventHandler';
import { LLMConfigGetHandler } from './handlers/LLMConfigHandler';

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

    const handlerRegistry = new HandlerRegistry();
    handlerRegistry.register(ConversationLoadHandler, stores, onote);
    handlerRegistry.register(ConversationSaveHandler, stores, onote);
    handlerRegistry.register(AgentFileReadHandler);
    handlerRegistry.register(AgentFileWriteHandler);
    handlerRegistry.register(AgentFileReplaceHandler);
    handlerRegistry.register(AgentFileCreateHandler);
    handlerRegistry.register(AgentFileDeleteHandler);
    handlerRegistry.register(AgentFileListHandler);
    handlerRegistry.register(AgentFileSearchHandler);
    handlerRegistry.register(AgentFileSearchInHandler);
    handlerRegistry.register(AgentContextLoadHandler, stores, onote);
    handlerRegistry.register(AgentContextSaveHandler, stores, onote);
    handlerRegistry.register(AgentExecutionStateLoadHandler, stores, onote);
    handlerRegistry.register(AgentExecutionStateSaveHandler, stores, onote);
    handlerRegistry.register(AgentExecutionStateDeleteHandler, stores, onote);
    handlerRegistry.register(GetCurrentFileInfoHandler, stores);
    handlerRegistry.register(AgentGetRootUriHandler, stores);
    handlerRegistry.register(AgentGetActiveFileUriHandler, stores);
    handlerRegistry.register(LLMConfigGetHandler);

    const handlers = handlerRegistry.getAllHandlers();

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
            data: { uri, rootUri: stores.activationStore.rootUri },
          });
        }
      },
    );

    receive(async (message) => {
      const result = await handlerRegistry.handle(message);
      return result;
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
