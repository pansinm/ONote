import type {
  AgentConfig,
  ExecutionStep,
  Message,
  PersistedContext,
  PersistedExecutionState,
  TodoItem,
} from '../types';
import { getLogger } from '/@/shared/logger';
import { LLM_BOX_MESSAGE_TYPES } from '../constants/LLMBoxConstants';
import type { Channel } from '../ipc';

interface ContextSaveResponse {
  error?: string;
  success?: boolean;
}

interface ContextLoadResponse {
  error?: string;
  agentContext?: PersistedContext;
}

interface ExecutionStateSaveResponse {
  error?: string;
  success?: boolean;
}

interface ExecutionStateLoadResponse {
  error?: string;
  state?: PersistedExecutionState;
}

export interface ContextSaveOptions {
  fileUri: string;
  executionLog: ExecutionStep[];
  conversationHistory: Message[];
  error: string | null;
  content: string;
  selection: string;
}

export interface ExecutionStateSaveOptions {
  fileUri: string;
  prompt: string;
  startTime: Date;
  isRunning: boolean;
  agentState: 'idle' | 'thinking' | 'executing';
  currentIteration: number;
  todos: TodoItem[];
  executionLog: ExecutionStep[];
}

const logger = getLogger('ContextManager');

export class ContextManager {
  private config: AgentConfig;
  private channel: Channel | null = null;

  constructor(config: AgentConfig) {
    this.config = config;
  }

  setChannel(channel: Channel): void {
    this.channel = channel;
  }

  async saveContext(options: ContextSaveOptions): Promise<void> {
    if (!this.channel) {
      logger.warn('Channel not set, cannot save context');
      return;
    }

    const { fileUri, executionLog, conversationHistory } = options;

    const contextToSave: PersistedContext = {
      version: 1,
      savedAt: Date.now(),
      fileUri,
      messages: conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      executionLog,
    };

    try {
      const response = (await this.channel.send({
        type: LLM_BOX_MESSAGE_TYPES.AGENT_CONTEXT_SAVE,
        data: {
          fileUri,
          rootUri: this.config.rootUri,
          context: contextToSave,
        },
      })) as ContextSaveResponse | undefined;

      if (!response) {
        logger.warn('No response from main process when saving context');
        return;
      }

      if (response.error) {
        throw new Error(String(response.error));
      }

      logger.info('Agent context saved', {
        fileUri,
        messageCount: conversationHistory.length,
      });
    } catch (error) {
      logger.error('Failed to save agent context', error);
      throw error;
    }
  }

  async loadContext(fileUri: string): Promise<PersistedContext | null> {
    if (!this.channel) {
      logger.warn('Channel not set, cannot load context');
      return null;
    }

    if (!this.config.rootUri) {
      logger.warn('Cannot load agent context: missing rootUri');
      return null;
    }

    try {
      const response = (await this.channel.send({
        type: LLM_BOX_MESSAGE_TYPES.AGENT_CONTEXT_LOAD,
        data: { fileUri, rootUri: this.config.rootUri },
      })) as ContextLoadResponse | undefined;

      if (!response) {
        logger.warn('No response from main process when loading context');
        return null;
      }

      if (response.error) {
        logger.error('Failed to load agent context', response.error);
        return null;
      }

      const agentContext = response.agentContext;

      logger.info('Agent context loaded', {
        fileUri,
        hasContext: !!agentContext,
        messageCount: agentContext?.messages?.length ?? 0,
        executionLogLength: agentContext?.executionLog?.length ?? 0,
      });

      return agentContext ?? null;
    } catch (error) {
      logger.error('Failed to load agent context', error);
      return null;
    }
  }

  async saveExecutionState(options: ExecutionStateSaveOptions): Promise<void> {
    if (!this.channel || !this.config.rootUri) {
      logger.debug(
        'Cannot save execution state: missing channel, fileUri or rootUri',
      );
      return;
    }

    const {
      fileUri,
      prompt,
      startTime,
      agentState,
      currentIteration,
      todos,
      executionLog,
    } = options;

    const state = {
      version: 1,
      savedAt: Date.now(),
      fileUri,
      prompt,
      startTime: startTime.getTime(),
      iteration: currentIteration,
      agentState,
      todos,
      steps: executionLog,
    };

    try {
      await this.channel.send({
        type: LLM_BOX_MESSAGE_TYPES.AGENT_EXECUTION_STATE_SAVE,
        data: {
          fileUri,
          rootUri: this.config.rootUri,
          state,
        },
      });

      logger.info('Execution state saved successfully', { fileUri });
    } catch (error) {
      logger.error('Failed to save execution state', error);
      throw error;
    }
  }

  async loadExecutionState(
    fileUri: string,
  ): Promise<PersistedExecutionState | null> {
    if (!this.channel || !this.config.rootUri) {
      logger.warn(
        'Cannot load execution state: missing channel, fileUri or rootUri',
      );
      return null;
    }

    try {
      const response = (await this.channel.send({
        type: LLM_BOX_MESSAGE_TYPES.AGENT_EXECUTION_STATE_LOAD,
        data: {
          fileUri,
          rootUri: this.config.rootUri,
        },
      })) as ExecutionStateLoadResponse | undefined;

      if (!response) {
        logger.warn(
          'No response from main process when loading execution state',
        );
        return null;
      }

      if (!response.state) {
        return null;
      }

      logger.info('Execution state loaded successfully', { fileUri });

      return response.state;
    } catch (error) {
      logger.error('Failed to load execution state', error);
      return null;
    }
  }

  async deleteExecutionState(fileUri: string): Promise<void> {
    if (!this.channel || !this.config.rootUri) {
      logger.warn(
        'Cannot delete execution state: missing channel, fileUri or rootUri',
      );
      return;
    }

    try {
      await this.channel.send({
        type: LLM_BOX_MESSAGE_TYPES.AGENT_EXECUTION_STATE_DELETE,
        data: {
          fileUri,
          rootUri: this.config.rootUri,
        },
      });

      logger.info('Execution state deleted successfully', { fileUri });
    } catch (error) {
      logger.error('Failed to delete execution state', error);
      throw error;
    }
  }
}

export default ContextManager;
