import { AgentConfig, ExecutionStep } from '../core/types';
import type { AgentMessage } from '../store/AgentStore';
import { getLogger } from '/@/shared/logger';
import { LLM_BOX_MESSAGE_TYPES } from '../constants/LLMBoxConstants';

interface Channel {
  send: (message: {
    type: string;
    data: unknown;
  }) => Promise<Record<string, unknown>>;
}

interface AgentContext {
  fileUri: string;
  executionLog: ExecutionStep[];
  conversationHistory: AgentMessage[];
  error: string | null;
  content: string;
  selection: string;
}

interface ContextSaveResponse {
  error?: string;
  success?: boolean;
}

interface ContextLoadResponse {
  error?: string;
  agentContext?: AgentContext;
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

  async saveContext(
    fileUri: string,
    executionLog: ExecutionStep[],
    conversationHistory: AgentMessage[],
    error: string | null,
    content: string,
    selection: string
  ): Promise<void> {
    if (!this.channel) {
      logger.warn('Channel not set, cannot save context');
      return;
    }

    const contextToSave: AgentContext = {
      fileUri,
      executionLog,
      conversationHistory,
      error,
      content,
      selection,
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
        stepCount: executionLog.length,
        messageCount: conversationHistory.length,
      });
    } catch (error) {
      logger.error('Failed to save agent context', error);
      throw error;
    }
  }

  async loadContext(fileUri: string): Promise<AgentContext | null> {
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
        executionLogCount: agentContext?.executionLog?.length ?? 0,
        conversationCount: agentContext?.conversationHistory?.length ?? 0,
      });

      return agentContext ?? null;
    } catch (error) {
      logger.error('Failed to load agent context', error);
      return null;
    }
  }

  async saveExecutionState(
    fileUri: string,
    prompt: string,
    startTime: Date,
    isRunning: boolean,
    agentState: 'idle' | 'thinking' | 'executing',
    currentIteration: number,
    todos: any[],
    executionLog: ExecutionStep[],
    conversationHistory: AgentMessage[],
    content: string,
    selection: string
  ): Promise<void> {
    if (!this.channel || !this.config.rootUri) {
      logger.debug('Cannot save execution state: missing channel, fileUri or rootUri');
      return;
    }

    const state = {
      prompt,
      startTime,
      isRunning,
      agentState,
      currentIteration,
      maxIterations: this.config.maxIterations || 50,
      todos,
      executionLog,
      conversationHistory: conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      fileUri,
      rootUri: this.config.rootUri || null,
      content,
      selection,
      savedAt: new Date(),
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
    fileUri: string
  ): Promise<any> {
    if (!this.channel || !this.config.rootUri) {
      logger.warn('Cannot load execution state: missing channel, fileUri or rootUri');
      return null;
    }

    try {
      const response = (await this.channel.send({
        type: LLM_BOX_MESSAGE_TYPES.AGENT_EXECUTION_STATE_LOAD,
        data: {
          fileUri,
          rootUri: this.config.rootUri,
        },
      })) as { state?: any } | undefined;

      if (!response) {
        logger.warn('No response from main process when loading execution state');
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
      logger.warn('Cannot delete execution state: missing channel, fileUri or rootUri');
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
