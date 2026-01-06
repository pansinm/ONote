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

function LLMBoxFrame() {
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    console.log('[LLMBoxFrame] useEffect triggered, ref.current:', ref.current, 'sidebarUrl:', stores.layoutStore.sidebarUrl);

    if (!ref.current?.contentWindow) {
      console.log('[LLMBoxFrame] contentWindow not ready, waiting...');
      return;
    }

    console.log('[LLMBoxFrame] contentWindow ready, creating channel');
    const { send, receive } = createChannel(
      ref.current!.contentWindow!,
      'MAIN_FRAME-LLM_BOX',
    );

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
        console.log('[LLMBoxFrame] Active file changed:', uri);
        if (uri) {
          send({
            type: LLM_BOX_MESSAGE_TYPES.EDITOR_FILE_OPEN,
            data: { uri },
          });
          console.log('[LLMBoxFrame] Sent EDITOR_FILE_OPEN:', uri);
        }
      },
    );

    receive(async ({ type, data }: any) => {
      console.log('[LLMBoxFrame] Received message:', { type, data });

      if (type === LLM_BOX_MESSAGE_TYPES.GET_CURRENT_FILE_INFO) {
        const { fileUri, rootUri } = {
          fileUri: stores.activationStore.activeFileUri,
          rootUri: stores.activationStore.rootUri,
        };
        console.log('[LLMBoxFrame] Handling GET_CURRENT_FILE_INFO:', { fileUri, rootUri });
        return { fileUri, rootUri };
      }

      if (type === LLM_BOX_MESSAGE_TYPES.LLM_CONVERSATION_LOAD) {
        const { fileUri } = data;
        const rootUri = stores.activationStore.rootUri;
        console.log('[LLMBoxFrame] Handling LLM_CONVERSATION_LOAD:', { fileUri, rootUri });
        
        try {
          const onote = (window as any).onote;
          console.log('[LLMBoxFrame] window.onote available:', !!onote);
          console.log('[LLMBoxFrame] window.onote.llmConversation available:', !!onote?.llmConversation);
          
          if (!onote?.llmConversation) {
            throw new Error('llmConversation not available');
          }
          
          const messages = await onote.llmConversation.invoke('loadConversation', {
            fileUri,
            rootUri,
          });
          console.log('[LLMBoxFrame] Loaded messages:', messages?.length);
          return { messages };
        } catch (error) {
          console.error('[LLMBoxFrame] Failed to load conversation:', error);
          return {
            error: error instanceof Error ? error.message : '加载对话历史失败',
          };
        }
      }

      if (type === LLM_BOX_MESSAGE_TYPES.LLM_CONVERSATION_SAVE) {
        const { fileUri, messages } = data;
        const rootUri = stores.activationStore.rootUri;
        console.log('[LLBoxFrame] Handling LLM_CONVERSATION_SAVE:', {
          fileUri,
          rootUri,
          messageCount: messages?.length,
        });
        
        try {
          const onote = (window as any).onote;
          console.log('[LLMBoxFrame] window.onote available:', !!onote);
          console.log('[LLMBoxFrame] window.onote.llmConversation available:', !!onote?.llmConversation);
          
          if (!onote?.llmConversation) {
            throw new Error('llmConversation not available');
          }
          
          await onote.llmConversation.invoke('saveConversation', {
            fileUri,
            messages,
            rootUri,
          });
          console.log('[LLMBoxFrame] Saved conversation successfully');
          return { success: true };
        } catch (error) {
          console.error('[MBoxFrame] Failed to save conversation:', error);
          return {
            error: error instanceof Error ? error.message : '保存对话历史失败',
          };
        }
      }
    });

    return () => {
      console.log('[LLMBoxFrame] Cleaning up');
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
