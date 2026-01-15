import { BaseHandler } from './BaseHandler';
import type { LLMConversationLoadResponse, LLMConversationSaveResponse } from '../types';
import stores from '/@/main/stores';
import { LLM_BOX_MESSAGE_TYPES } from '../../../../llmbox/utils/constants';

export class ConversationLoadHandler extends BaseHandler {
  async handle(data: { fileUri: string }): Promise<LLMConversationLoadResponse> {
    const rootUri = stores.activationStore.rootUri;
    const onote = (window as any).onote;

    return this.wrapWithErrorHandling(async () => {
      if (!onote?.llmConversation) {
        throw new Error('llmConversation not available');
      }

      const messages = await onote.llmConversation.invoke('loadConversation', {
        fileUri: data.fileUri,
        rootUri,
      });

      return { messages } as LLMConversationLoadResponse;
    }, 'Failed to load conversation');
  }

  static getMessageType(): string {
    return LLM_BOX_MESSAGE_TYPES.LLM_CONVERSATION_LOAD;
  }
}

export class ConversationSaveHandler extends BaseHandler {
  async handle(data: { fileUri: string; messages: unknown[] }): Promise<LLMConversationSaveResponse> {
    const rootUri = stores.activationStore.rootUri;
    const onote = (window as any).onote;

    return this.wrapWithErrorHandling(async () => {
      if (!onote?.llmConversation) {
        throw new Error('llmConversation not available');
      }

      await onote.llmConversation.invoke('saveConversation', {
        fileUri: data.fileUri,
        messages: data.messages,
        rootUri,
      });

      return { success: true };
    }, 'Failed to save conversation');
  }

  static getMessageType(): string {
    return LLM_BOX_MESSAGE_TYPES.LLM_CONVERSATION_SAVE;
  }
}
