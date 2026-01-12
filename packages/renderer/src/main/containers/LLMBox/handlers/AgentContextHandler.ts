import { BaseHandler } from './BaseHandler';
import type {
  AgentContextLoadResponse,
  AgentContextSaveResponse,
  AgentExecutionStateLoadResponse,
  AgentExecutionStateSaveResponse,
  AgentExecutionStateDeleteResponse,
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

      const agentContext = await this.onote.agentContext.invoke('loadAgentContext', {
        fileUri: data.fileUri,
        rootUri,
      });

      return { agentContext };
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

export class AgentExecutionStateLoadHandler extends BaseHandler {
  constructor(private stores: any, private onote: any) {
    super();
  }

  async handle(data: { fileUri: string }): Promise<AgentExecutionStateLoadResponse> {
    const rootUri = this.stores.activationStore.rootUri;

    return this.wrapWithErrorHandling(async () => {
      if (!this.onote?.agentContext) {
        throw new Error('agentContext not available');
      }

      const state = await this.onote.agentContext.invoke('loadExecutionState', {
        fileUri: data.fileUri,
        rootUri,
      });

      return { state };
    }, 'Failed to load execution state');
  }
}

export class AgentExecutionStateSaveHandler extends BaseHandler {
  constructor(private stores: any, private onote: any) {
    super();
  }

  async handle(data: { fileUri: string; state: any }): Promise<AgentExecutionStateSaveResponse> {
    const rootUri = this.stores.activationStore.rootUri;

    return this.wrapWithErrorHandling(async () => {
      if (!this.onote?.agentContext) {
        throw new Error('agentContext not available');
      }

      await this.onote.agentContext.invoke('saveExecutionState', {
        fileUri: data.fileUri,
        rootUri,
        state: data.state,
      });

      return { success: true };
    }, 'Failed to save execution state');
  }
}

export class AgentExecutionStateDeleteHandler extends BaseHandler {
  constructor(private stores: any, private onote: any) {
    super();
  }

  async handle(data: { fileUri: string }): Promise<AgentExecutionStateDeleteResponse> {
    const rootUri = this.stores.activationStore.rootUri;

    return this.wrapWithErrorHandling(async () => {
      if (!this.onote?.agentContext) {
        throw new Error('agentContext not available');
      }

      await this.onote.agentContext.invoke('deleteExecutionState', {
        fileUri: data.fileUri,
        rootUri,
      });

      return { success: true };
    }, 'Failed to delete execution state');
  }
}
