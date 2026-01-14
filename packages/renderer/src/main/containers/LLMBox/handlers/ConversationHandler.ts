import { BaseHandler } from './BaseHandler';
import type { LLMConversationLoadResponse, LLMConversationSaveResponse } from '../types';
import type { Stores, OnoteAPI } from '/@/main/stores/types';
import { LLM_BOX_MESSAGE_TYPES } from '../../../../llmbox/constants/LLMBoxConstants';

export class ConversationLoadHandler extends BaseHandler {
  constructor(private stores: Stores, private onote: OnoteAPI) {
    super();
  }

  async handle(data: { fileUri: string }): Promise<LLMConversationLoadResponse> {
    const rootUri = this.stores.activationStore.rootUri;

    return this.wrapWithErrorHandling(async () => {
      if (!this.onote?.llmConversation) {
        throw new Error('llmConversation not available');
      }

      const messages = await this.onote.llmConversation.invoke('loadConversation', {
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
  constructor(private stores: Stores, private onote: OnoteAPI) {
    super();
  }

  async handle(data: { fileUri: string; messages: unknown[] }): Promise<LLMConversationSaveResponse> {
    const rootUri = this.stores.activationStore.rootUri;

    return this.wrapWithErrorHandling(async () => {
      if (!this.onote?.llmConversation) {
        throw new Error('llmConversation not available');
      }

      await this.onote.llmConversation.invoke('saveConversation', {
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
