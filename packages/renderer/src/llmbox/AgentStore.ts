import { makeAutoObservable, runInAction } from 'mobx';
import type { Tool, ExecutionStep, AgentConfig, TodoItem, AgentExecutionState } from './agent/types';
import ToolRegistry from './agent/ToolRegistry';
import { AgentOrchestrator } from './agent/AgentOrchestrator';
import TodoManager from './agent/TodoManager';
import { getLogger } from '../shared/logger';
import { uuid } from '../common/tunnel/utils';
import { LLM_BOX_MESSAGE_TYPES } from './constants/LLMBoxConstants';

const logger = getLogger('AgentStore');

interface AgentMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: Date;
  toolCallId?: string;
}

interface Channel {
  send: (message: { type: string; data: unknown }) => Promise<Record<string, unknown>>;
}

export class AgentStore {
  todos: TodoItem[] = [];

  tools: Tool[] = [];

  executionLog: ExecutionStep[] = [];

  conversationHistory: AgentMessage[] = [];

  agentState: 'idle' | 'thinking' | 'executing' = 'idle';

  error: string | null = null;

  isRunning = false;

  hasSavedState = false;

  lastStateSavedAt: Date | null = null;

  fileUri: string | null = null;

  content = '';

  selection = '';

  maxConversationRounds = 50;

  compressThreshold = 20;

  private config: AgentConfig;
  private channel: Channel;
  private todoManager: TodoManager;
  private toolRegistry: ToolRegistry;
  private orchestrator: AgentOrchestrator | null = null;
  private currentPrompt = '';
  private executionStartTime: Date | null = null;
  private currentIteration = 0;

  constructor(config: AgentConfig, channel: Channel) {
    this.config = config;
    this.channel = channel;
    this.todoManager = new TodoManager();
    this.toolRegistry = new ToolRegistry(channel, this.todoManager);

    makeAutoObservable(this);
    this.loadTools();
  }

  loadTools(): void {
    const tools = this.toolRegistry.getAll();
    runInAction(() => {
      this.tools = tools;
    });
    logger.info('Tools loaded', { count: tools.length });
  }

  updateFileUri(fileUri: string): void {
    runInAction(() => {
      this.fileUri = fileUri;
    });
  }

  updateRootUri(rootUri: string): void {
    runInAction(() => {
      this.config.rootUri = rootUri;
    });
  }

  updateEditorContent(content: string, selection: string): void {
    runInAction(() => {
      this.content = content;
      this.selection = selection;
    });
  }

  addMessage(message: Omit<AgentMessage, 'id' | 'timestamp'>): void {
    runInAction(() => {
      this.conversationHistory.push({
        ...message,
        id: uuid('agent-msg-'),
        timestamp: new Date(),
      });
    });
  }

  addStep(step: Omit<ExecutionStep, 'id' | 'timestamp'>): void {
    const stepId = uuid('agent-step-');
    const stepWithId = {
      ...step,
      id: stepId,
      timestamp: new Date(),
    };

    logger.debug('Adding step to execution log', {
      id: stepId,
      type: step.type,
      currentCount: this.executionLog.length,
    });

    runInAction(() => {
      this.executionLog.push(stepWithId);
    });
  }

  clearLog(): void {
    runInAction(() => {
      this.executionLog = [];
    });
  }

  clearConversation(): void {
    runInAction(() => {
      this.conversationHistory = [];
    });
  }

  setError(error: string | null): void {
    runInAction(() => {
      this.error = error;
    });
  }

  setRunning(running: boolean): void {
    runInAction(() => {
      this.isRunning = running;
    });
  }

  clearError(): void {
    this.setError(null);
  }

  // ========== 公共方法 ==========

  stopAgent(): void {
    logger.info('Stopping agent');
    if (this.orchestrator) {
      this.orchestrator.stop();
    }
    this.setRunning(false);
  }

  // ========== 私有方法 ==========

  private getDirectoryFromUri(fileUri: string): string {
    const withoutProtocol = fileUri.replace('file://', '');
    const lastSlashIndex = withoutProtocol.lastIndexOf('/');
    if (lastSlashIndex === -1) {
      return withoutProtocol;
    }
    return withoutProtocol.substring(0, lastSlashIndex);
  }

  private buildContextPrompt(
    fileUri: string,
    userPrompt: string,
    hasContext: boolean,
  ): string {
    const parts: string[] = [];

    parts.push('## Context');

    if (fileUri) {
      const workingDir = this.getDirectoryFromUri(fileUri);
      parts.push(`Working Directory: ${workingDir}`);
      parts.push(`Current File: ${fileUri}`);
    }

    if (this.selection) {
      parts.push(`Selected Content:\n\`\`\`\n${this.selection}\n\`\`\``);
    }

    if (this.content) {
      parts.push(`Current File Content:\n\`\`\`\n${this.content}\n\`\`\``);
    }

    parts.push('## Task');
    parts.push(userPrompt);

    if (hasContext) {
      parts.push(
        `\n## Previous Context\nTasks: ${this.executionLog.length}, Messages: ${this.conversationHistory.length}`,
      );
    }

    return `${parts.join('\n')}\n\n`;
  }

  async runAgent(prompt: string): Promise<void> {
    if (this.isRunning) {
      logger.warn('Agent is already running, ignoring new request');
      return;
    }

    try {
      this.setRunning(true);
      this.clearError();
      this.clearLog();

      runInAction(() => {
        this.currentPrompt = prompt;
        this.executionStartTime = new Date();
        this.currentIteration = 0;
      });

      const hasFileContent = !!this.content;

      const userPrompt = this.buildContextPrompt(
        this.fileUri || '',
        prompt,
        hasFileContent,
      );

      const conversationHistory = this.conversationHistory
        .filter((msg: any) => {
          return (
            msg.role === 'user' ||
            msg.role === 'assistant' ||
            msg.role === 'system'
          );
        })
        .map((msg: any) => ({
          ...msg,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
        }));

      this.orchestrator = new AgentOrchestrator(
        {
          config: this.config,
          toolRegistry: this.toolRegistry,
          onStep: this.addStep.bind(this),
          onStateChange: (state) => {
            runInAction(() => {
              this.agentState = state;
            });
          },
          onMessage: (message) => {
            this.addMessage(message);
          },
          onTodoChange: (todos) => {
            runInAction(() => {
              this.todos = todos;
            });
          },
          onSaveState: this.saveExecutionState.bind(this),
          hasFileContent,
        },
        this.todoManager,
      );

      await this.orchestrator.run(userPrompt, conversationHistory);
      this.setRunning(false);
      logger.info('Agent execution completed', {
        steps: this.executionLog.length,
        messages: this.conversationHistory.length,
      });
    } catch (error) {
      this.setRunning(false);
      this.setError(error instanceof Error ? error.message : 'Unknown error');
      logger.error('Agent execution failed', error);
      throw error;
    }
  }

  async compressConversation(): Promise<void> {
    logger.warn('compressConversation() is deprecated. Compression is now handled by AgentOrchestrator');
  }

  async saveContext(fileUri: string): Promise<void> {
    try {
      const contextToSave = {
        fileUri,
        executionLog: this.executionLog,
        conversationHistory: this.conversationHistory,
        error: this.error,
        content: this.content,
        selection: this.selection,
      };

      const response = await this.channel.send({
        type: 'AGENT_CONTEXT_SAVE',
        data: {
          fileUri,
          rootUri: this.config.rootUri,
          context: contextToSave,
        },
      });

      if (response.error) {
        throw new Error(response.error);
      }

      logger.info('Agent context saved', {
        fileUri,
        stepCount: this.executionLog.length,
        messageCount: this.conversationHistory.length,
      });
    } catch (error) {
      logger.error('Failed to save agent context', error);
    }
  }

  async loadContext(fileUri: string): Promise<any> {
    if (!this.config.rootUri) {
      logger.warn('Cannot load agent context: missing rootUri');
      return null;
    }

    try {
      const response = (await this.channel.send({
        type: 'AGENT_CONTEXT_LOAD',
        data: { fileUri, rootUri: this.config.rootUri },
      })) as { error?: string; agentContext?: any };

      if (response.error) {
        logger.error('Failed to load agent context', response.error);
        return null;
      }

      const agentContext = response.agentContext;

      runInAction(() => {
        // 设置当前文件的 fileUri（不从上下文中加载）
        this.fileUri = fileUri;

        if (!agentContext) {
          logger.debug(
            'No agentContext found for file, resetting conversation and execution data',
            { fileUri },
          );

          this.error = null;
          this.selection = '';
          this.executionLog = [];
          this.conversationHistory = [];
        } else {
          this.error = agentContext.error || null;
          this.selection = agentContext.selection || '';
          this.executionLog = agentContext.executionLog || [];
          this.conversationHistory = agentContext.conversationHistory || [];
        }
      });

      logger.info('Agent context loaded', {
        fileUri: this.fileUri,
        hasContext: !!agentContext,
        executionLogCount: agentContext.executionLog?.length || 0,
        conversationCount: agentContext.conversationHistory?.length || 0,
      });

      return agentContext;
    } catch (error) {
      logger.error('Failed to load agent context', error);
      return null;
    }
  }

  isConversationHistoryEmpty(): boolean {
    return this.conversationHistory.length === 0;
  }

  isExecutionLogEmpty(): boolean {
    return this.executionLog.length === 0;
  }

  async saveExecutionState(): Promise<void> {
    if (!this.fileUri || !this.config.rootUri) {
      logger.warn('Cannot save execution state: missing fileUri or rootUri');
      return;
    }

    const state: AgentExecutionState = {
      prompt: this.currentPrompt,
      startTime: this.executionStartTime || new Date(),
      isRunning: this.isRunning,
      agentState: this.agentState,
      currentIteration: this.currentIteration,
      maxIterations: this.config.maxIterations || 10,
      todos: this.todos,
      executionLog: this.executionLog.map(step => ({
        ...step,
        timestamp: step.timestamp,
      })),
      conversationHistory: this.conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      fileUri: this.fileUri,
      rootUri: this.config.rootUri || null,
      content: this.content,
      selection: this.selection,
      savedAt: new Date(),
    };

    try {
      await this.channel.send({
        type: LLM_BOX_MESSAGE_TYPES.AGENT_EXECUTION_STATE_SAVE,
        data: {
          fileUri: this.fileUri,
          rootUri: this.config.rootUri,
          state,
        },
      });

      runInAction(() => {
        this.hasSavedState = true;
        this.lastStateSavedAt = new Date();
      });

      logger.info('Execution state saved successfully', {
        fileUri: this.fileUri,
        iteration: state.currentIteration,
      });
    } catch (error) {
      logger.error('Failed to save execution state', error);
    }
  }

  async loadExecutionState(): Promise<AgentExecutionState | null> {
    if (!this.fileUri || !this.config.rootUri) {
      logger.warn('Cannot load execution state: missing fileUri or rootUri');
      return null;
    }

    try {
      const response = await this.channel.send({
        type: LLM_BOX_MESSAGE_TYPES.AGENT_EXECUTION_STATE_LOAD,
        data: {
          fileUri: this.fileUri,
          rootUri: this.config.rootUri,
        },
      }) as { state?: AgentExecutionState };

      if (!response.state) {
        runInAction(() => {
          this.hasSavedState = false;
        });
        return null;
      }

      const state = response.state;

      const parseDate = (value: unknown): Date => {
        if (value instanceof Date) return value;
        if (typeof value === 'string' || typeof value === 'number')
          return new Date(value);
        return new Date();
      };

      const stateWithDates: AgentExecutionState = {
        ...state,
        startTime: parseDate(state.startTime),
        todos: state.todos.map((todo) => ({
          ...todo,
          createdAt: parseDate(todo.createdAt),
          updatedAt: parseDate(todo.updatedAt),
        })),
        executionLog: state.executionLog.map((step) => ({
          ...step,
          timestamp: parseDate(step.timestamp),
        })),
        savedAt: parseDate(state.savedAt),
      };

      runInAction(() => {
        this.hasSavedState = true;
      });

      logger.info('Execution state loaded successfully', {
        fileUri: this.fileUri,
        iteration: stateWithDates.currentIteration,
      });

      return stateWithDates;
    } catch (error) {
      logger.error('Failed to load execution state', error);
      return null;
    }
  }

  async resumeExecution(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Cannot resume execution: agent is already running');
      return;
    }

    const state = await this.loadExecutionState();
    if (!state) {
      throw new Error('No saved execution state found');
    }

    try {
      this.setRunning(true);
      this.clearError();

      runInAction(() => {
        this.todos = state.todos;
        this.executionLog = state.executionLog;
        this.conversationHistory = state.conversationHistory.map((msg: any) => ({
          ...msg,
          id: uuid('agent-msg-'),
          timestamp: new Date(),
        }));
        this.currentIteration = state.currentIteration;
        this.currentPrompt = state.prompt;
        this.executionStartTime = state.startTime;
        this.content = state.content;
        this.selection = state.selection;
      });

      const conversationHistory = this.conversationHistory.filter((msg: any) => {
        return msg.role === 'user' || msg.role === 'assistant' || msg.role === 'system';
      });

      await this.orchestrator.run(state.prompt, conversationHistory, {
        clearTodos: false,
        startIteration: state.currentIteration,
      });
      this.setRunning(false);
      logger.info('Agent execution resumed successfully', {
        steps: this.executionLog.length,
        messages: this.conversationHistory.length,
      });
    } catch (error) {
      this.setRunning(false);
      this.setError(error instanceof Error ? error.message : 'Unknown error');
      logger.error('Agent execution resumed failed', error);
      throw error;
    }
  }

  async deleteExecutionState(): Promise<void> {
    if (!this.fileUri || !this.config.rootUri) {
      logger.warn('Cannot delete execution state: missing fileUri or rootUri');
      return;
    }

    try {
      await this.channel.send({
        type: LLM_BOX_MESSAGE_TYPES.AGENT_EXECUTION_STATE_DELETE,
        data: {
          fileUri: this.fileUri,
          rootUri: this.config.rootUri,
        },
      });

      runInAction(() => {
        this.hasSavedState = false;
        this.lastStateSavedAt = null;
      });

      logger.info('Execution state deleted successfully', {
        fileUri: this.fileUri,
      });
    } catch (error) {
      logger.error('Failed to delete execution state', error);
    }
  }
}

export default AgentStore;
