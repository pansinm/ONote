import { BaseHandler } from './BaseHandler';
import type {
  AgentContextLoadResponse,
  AgentContextSaveResponse,
} from '../types';

export class AgentContextLoadHandler extends BaseHandler {
  constructor(private stores: any, private onote: any) {
    super();
  }

  async handle(data: { fileUri: string }): Promise<AgentContextLoadResponse> {
    const rootUri = this.stores.activationStore.rootUri;

    return this.wrapWithErrorHandling(async () => {
      if (!this.onote?.agentContext) {
        throw new Error('agentContext not available');
      }

      const context = await this.onote.agentContext.invoke('loadAgentContext', {
        fileUri: data.fileUri,
        rootUri,
      });

      return { context };
    }, 'Failed to load agent context');
  }
}

export class AgentContextSaveHandler extends BaseHandler {
  constructor(private stores: any, private onote: any) {
    super();
  }

  async handle(data: { fileUri: string; context: any }): Promise<AgentContextSaveResponse> {
    const rootUri = this.stores.activationStore.rootUri;

    return this.wrapWithErrorHandling(async () => {
      if (!this.onote?.agentContext) {
        throw new Error('agentContext not available');
      }

      await this.onote.agentContext.invoke('saveAgentContext', {
        fileUri: data.fileUri,
        rootUri,
        context: data.context,
      });

      return { success: true };
    }, 'Failed to save agent context');
  }
}
