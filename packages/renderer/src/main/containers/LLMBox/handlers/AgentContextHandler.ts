import { BaseHandler } from './BaseHandler';
import type {
  AgentContextLoadResponse,
  AgentContextSaveResponse,
  AgentExecutionStateLoadResponse,
  AgentExecutionStateSaveResponse,
  AgentExecutionStateDeleteResponse,
} from '../types';
import stores from '/@/main/stores';
import { LLM_BOX_MESSAGE_TYPES } from '../../../../llmbox/utils/constants';

export class AgentContextLoadHandler extends BaseHandler {
  async handle(data: { fileUri: string }): Promise<AgentContextLoadResponse> {
    const rootUri = stores.activationStore.rootUri;
    const onote = (window as any).onote;

    return this.wrapWithErrorHandling(async () => {
      if (!onote?.agentContext) {
        throw new Error('agentContext not available');
      }

      const agentContext = await onote.agentContext.invoke('loadAgentContext', {
        fileUri: data.fileUri,
        rootUri,
      });

      return { agentContext };
    }, 'Failed to load agent context');
  }

  static getMessageType(): string {
    return LLM_BOX_MESSAGE_TYPES.AGENT_CONTEXT_LOAD;
  }
}

export class AgentContextSaveHandler extends BaseHandler {
  async handle(data: { fileUri: string; context: unknown }): Promise<AgentContextSaveResponse> {
    const rootUri = stores.activationStore.rootUri;
    const onote = (window as any).onote;

    return this.wrapWithErrorHandling(async () => {
      if (!onote?.agentContext) {
        throw new Error('agentContext not available');
      }

      await onote.agentContext.invoke('saveAgentContext', {
        fileUri: data.fileUri,
        rootUri,
        context: data.context,
      });

      return { success: true };
    }, 'Failed to save agent context');
  }

  static getMessageType(): string {
    return LLM_BOX_MESSAGE_TYPES.AGENT_CONTEXT_SAVE;
  }
}

export class AgentExecutionStateLoadHandler extends BaseHandler {
  async handle(data: { fileUri: string }): Promise<AgentExecutionStateLoadResponse> {
    const rootUri = stores.activationStore.rootUri;
    const onote = (window as any).onote;

    return this.wrapWithErrorHandling(async () => {
      if (!onote?.agentContext) {
        throw new Error('agentContext not available');
      }

      const state = await onote.agentContext.invoke('loadExecutionState', {
        fileUri: data.fileUri,
        rootUri,
      });

      return { state };
    }, 'Failed to load execution state');
  }

  static getMessageType(): string {
    return LLM_BOX_MESSAGE_TYPES.AGENT_EXECUTION_STATE_LOAD;
  }
}

export class AgentExecutionStateSaveHandler extends BaseHandler {
  async handle(data: { fileUri: string; state: unknown }): Promise<AgentExecutionStateSaveResponse> {
    const rootUri = stores.activationStore.rootUri;
    const onote = (window as any).onote;

    return this.wrapWithErrorHandling(async () => {
      if (!onote?.agentContext) {
        throw new Error('agentContext not available');
      }

      await onote.agentContext.invoke('saveExecutionState', {
        fileUri: data.fileUri,
        rootUri,
        state: data.state,
      });

      return { success: true };
    }, 'Failed to save execution state');
  }

  static getMessageType(): string {
    return LLM_BOX_MESSAGE_TYPES.AGENT_EXECUTION_STATE_SAVE;
  }
}

export class AgentExecutionStateDeleteHandler extends BaseHandler {
  async handle(data: { fileUri: string }): Promise<AgentExecutionStateDeleteResponse> {
    const rootUri = stores.activationStore.rootUri;
    const onote = (window as any).onote;

    return this.wrapWithErrorHandling(async () => {
      if (!onote?.agentContext) {
        throw new Error('agentContext not available');
      }

      await onote.agentContext.invoke('deleteExecutionState', {
        fileUri: data.fileUri,
        rootUri,
      });

      return { success: true };
    }, 'Failed to delete execution state');
  }

  static getMessageType(): string {
    return LLM_BOX_MESSAGE_TYPES.AGENT_EXECUTION_STATE_DELETE;
  }
}
