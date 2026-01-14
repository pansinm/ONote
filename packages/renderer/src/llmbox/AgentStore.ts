import { makeAutoObservable, runInAction } from 'mobx';
import {
  ExecutionStep,
  AgentConfig,
  TodoItem,
  AgentExecutionState,
  Tool,
  ToolCall,
} from './core/types';
import { LLMClient } from './core/api/client';
import { ToolRegistry, AgentOrchestrator } from './agent';
import { TodoManager as TodoManagerImpl } from './agent/tools/todo-manager';
import type { TodoManager as TodoManagerType } from './agent/tools/todo';
import { getLogger } from '../shared/logger';
import { uuid } from '../common/tunnel/utils';
import {
  LLM_BOX_MESSAGE_TYPES,
} from './constants/LLMBoxConstants';

const logger = getLogger('AgentStore');

interface Channel {
  send: (message: {
    type: string;
    data: unknown;
  }) => Promise<Record<string, unknown>>;
}

interface AgentMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: Date;
  toolCallId?: string;
  tool_calls?: ToolCall[];
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

  private config: AgentConfig;
  private channel: Channel;
  private todoManager: TodoManagerImpl;
  private toolRegistry: ToolRegistry;
  private llmClient: LLMClient;
  private orchestrator: AgentOrchestrator | null = null;
  private currentPrompt = '';
  private executionStartTime: Date | null = null;
  private disposer: (() => void) | null = null;

  constructor(config: AgentConfig, channel: Channel) {
    this.config = config;
    this.channel = channel;
    this.todoManager = new TodoManagerImpl();
    this.llmClient = new LLMClient({
      apiKey: config.apiKey,
      model: config.model,
      apiBase: config.apiBase,
    });
    this.toolRegistry = new ToolRegistry(channel, this.todoManager);

    makeAutoObservable(this);
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
      this.config = { ...this.config, rootUri };
    });
  }

  updateEditorContent(content: string, selection: string): void {
    runInAction(() => {
      this.content = content;
      this.selection = selection;
    });
  }

  async fetchLLMConfig(): Promise<{ apiKey: string; model: string; apiBase: string } | null> {
    try {
      const response = (await this.channel.send({
        type: LLM_BOX_MESSAGE_TYPES.LLM_CONFIG_GET,
        data: {},
      })) as { apiKey?: string; model?: string; apiBase?: string; error?: string };

      if (response.error) {
        logger.warn('Failed to fetch LLM config from main process', { error: response.error });
        return null;
      }

      const result = {
        apiKey: response.apiKey ?? this.config.apiKey,
        model: response.model ?? this.config.model,
        apiBase: response.apiBase ?? this.config.apiBase,
      };

      logger.debug('LLM config fetched', {
        apiBase: result.apiBase,
        model: result.model,
        hasApiKey: !!result.apiKey,
      });

      return result;
    } catch (error) {
      logger.error('Error fetching LLM config', error);
      return null;
    }
  }

  addMessage(message: { role: string; content: string; toolCallId?: string; tool_calls?: unknown[] }): void {
    runInAction(() => {
      this.conversationHistory.push({
        ...message,
        id: uuid('agent-msg-'),
        timestamp: new Date(),
      } as AgentMessage);
    });
  }

  addStep(step: Omit<ExecutionStep, 'id' | 'timestamp'>): string {
    const stepId = uuid('agent-step-');
    runInAction(() => {
      this.executionLog.push({
        ...step,
        id: stepId,
        timestamp: new Date(),
      });
    });
    return stepId;
  }

  updateThinkingStepContent(stepId: string, content: string): void {
    runInAction(() => {
      const step = this.executionLog.find((s) => s.id === stepId);
      if (step && step.type === 'thinking') {
        step.content = content;
      }
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

  stopAgent(): void {
    logger.info('Stopping agent');
    if (this.disposer) {
      this.disposer();
      this.disposer = null;
    }
    if (this.orchestrator) {
      this.orchestrator.stop();
    }
    this.setRunning(false);
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

      if (this.disposer) {
        this.disposer();
        this.disposer = null;
      }

      runInAction(() => {
        this.currentPrompt = prompt;
        this.executionStartTime = new Date();
        this.conversationHistory.push({
          id: uuid('agent-msg-'),
          role: 'user',
          content: prompt,
          timestamp: new Date(),
        });
      });

      const llmConfig = await this.fetchLLMConfig();
      if (llmConfig) {
        this.llmClient = new LLMClient({
          apiKey: llmConfig.apiKey,
          model: llmConfig.model,
          apiBase: llmConfig.apiBase,
        });
      }

      const hasFileContent = !!this.content;

      const conversationHistory = this.conversationHistory.map((msg) => ({
        ...msg,
        timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp as unknown as string),
      }));

      this.orchestrator = new AgentOrchestrator(this.config, {
        toolRegistry: this.toolRegistry,
        llmClient: this.llmClient,
        todoManager: this.todoManager,
      });

      const disposerStep = this.orchestrator.on('step', (step) => this.addStep(step));
      const disposerThinkingChunk = this.orchestrator.on('thinkingChunk', ({ stepId, content }) => {
        this.updateThinkingStepContent(stepId, content);
      });
      const disposerStateChange = this.orchestrator.on('stateChange', (state) => {
        runInAction(() => {
          this.agentState = state;
        });
      });
      const disposerMessage = this.orchestrator.on('message', (message) => {
        this.addMessage(message);
      });
      const disposerTodoChange = this.orchestrator.on('todoChange', (todos) => {
        runInAction(() => {
          this.todos = todos;
        });
      });

      this.disposer = () => {
        disposerStep();
        disposerThinkingChunk();
        disposerStateChange();
        disposerMessage();
        disposerTodoChange();
      };

      await this.orchestrator.run(prompt, conversationHistory, {
        clearTodos: true,
        startIteration: 0,
      });

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
        throw new Error(String(response.error));
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

  async loadContext(fileUri: string): Promise<unknown> {
    if (!this.config.rootUri) {
      logger.warn('Cannot load agent context: missing rootUri');
      return null;
    }

    try {
      const response = (await this.channel.send({
        type: 'AGENT_CONTEXT_LOAD',
        data: { fileUri, rootUri: this.config.rootUri },
      })) as { error?: string; agentContext?: unknown };

      if (response.error) {
        logger.error('Failed to load agent context', response.error);
        return null;
      }

      const agentContext = response.agentContext;

      runInAction(() => {
        this.fileUri = fileUri;

        if (!agentContext) {
          this.error = null;
          this.selection = '';
          this.executionLog = [];
          this.conversationHistory = [];
        } else {
          const ctx = agentContext as Record<string, unknown>;
          this.error = (ctx.error as string) || null;
          this.selection = (ctx.selection as string) || '';
          this.executionLog = (ctx.executionLog as ExecutionStep[]) || [];
          this.conversationHistory = (ctx.conversationHistory as AgentMessage[]) || [];
        }
      });

      logger.info('Agent context loaded', {
        fileUri: this.fileUri,
        hasContext: !!agentContext,
        executionLogCount: this.executionLog.length,
        conversationCount: this.conversationHistory.length,
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
      logger.debug('Cannot save execution state: missing fileUri or rootUri');
      return;
    }

    const state: AgentExecutionState = {
      prompt: this.currentPrompt,
      startTime: this.executionStartTime || new Date(),
      isRunning: this.isRunning,
      agentState: this.agentState,
      currentIteration: 0,
      maxIterations: this.config.maxIterations || 50,
      todos: this.todos,
      executionLog: this.executionLog,
      conversationHistory: this.conversationHistory.map((msg) => ({
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
      const response = (await this.channel.send({
        type: LLM_BOX_MESSAGE_TYPES.AGENT_EXECUTION_STATE_LOAD,
        data: {
          fileUri: this.fileUri,
          rootUri: this.config.rootUri,
        },
      })) as { state?: AgentExecutionState };

      if (!response.state) {
        runInAction(() => {
          this.hasSavedState = false;
        });
        return null;
      }

      runInAction(() => {
        this.hasSavedState = true;
      });

      logger.info('Execution state loaded successfully', {
        fileUri: this.fileUri,
      });

      return response.state;
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

        if (this.disposer) {
          this.disposer();
          this.disposer = null;
        }

        runInAction(() => {
        this.todos = state.todos;
        this.executionLog = state.executionLog;
        this.conversationHistory = state.conversationHistory.map(
          (msg) => ({
            id: uuid('agent-msg-'),
            role: msg.role as 'user' | 'assistant' | 'system' | 'tool',
            content: msg.content,
            timestamp: new Date(),
          })
        );
        this.currentPrompt = state.prompt;
        this.executionStartTime = state.startTime;
        this.content = state.content;
        this.selection = state.selection;
      });

      this.orchestrator = new AgentOrchestrator(this.config, {
        toolRegistry: this.toolRegistry,
        llmClient: this.llmClient,
        todoManager: this.todoManager,
      });

      const disposerStep = this.orchestrator.on('step', (step) => this.addStep(step));
      const disposerStateChange = this.orchestrator.on('stateChange', (state) => {
        runInAction(() => {
          this.agentState = state;
        });
      });
      const disposerMessage = this.orchestrator.on('message', (message) => {
        this.addMessage(message);
      });
      const disposerTodoChange = this.orchestrator.on('todoChange', (todos) => {
        runInAction(() => {
          this.todos = todos;
        });
      });

      this.disposer = () => {
        disposerStep();
        disposerStateChange();
        disposerMessage();
        disposerTodoChange();
      };

      const historyMessages = state.conversationHistory.map((msg) => ({
        id: uuid('hist-'),
        role: msg.role as 'user' | 'assistant' | 'system' | 'tool',
        content: msg.content,
        timestamp: new Date(),
      }));

      await this.orchestrator.run(state.prompt, historyMessages, {
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
