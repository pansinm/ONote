import { BaseHandler } from './BaseHandler';
import type { LLMConversationLoadResponse, LLMConversationSaveResponse } from '../types';

export class ConversationLoadHandler extends BaseHandler {
  constructor(private stores: any, private onote: any) {
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
}

export class ConversationSaveHandler extends BaseHandler {
  constructor(private stores: any, private onote: any) {
    super();
  }

  async handle(data: { fileUri: string; messages: any[] }): Promise<LLMConversationSaveResponse> {
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
}
