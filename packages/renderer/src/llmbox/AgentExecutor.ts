import { makeAutoObservable, runInAction } from 'mobx';
import { throttle } from 'lodash';
import { AgentConfig, ExecutionStep } from './core/types';
import { AgentOrchestrator } from './agent/orchestrator';
import { ToolRegistry } from './agent/tools/registry';
import { TodoManager as TodoManagerImpl } from './agent/tools/todo-manager';
import { LLMClient } from './core/api/client';
import { AgentState } from './AgentState';
import { ConfigManager } from './ConfigManager';
import { ContextManager } from './ContextManager';
import { getLogger } from '/@/shared/logger';
import { uuid } from '../common/tunnel/utils';

const logger = getLogger('AgentExecutor');

export interface AgentDependencies {
  toolRegistry?: ToolRegistry;
  llmClient?: LLMClient;
  todoManager?: TodoManagerImpl;
}

interface AgentMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: Date;
  toolCallId?: string;
  tool_calls?: any[];
}

const THROTTLE_DELAY = 50;

export class AgentExecutor {
  private config: AgentConfig;
  private state: AgentState;
  private configManager: ConfigManager;
  private contextManager: ContextManager;
  private deps: { toolRegistry: ToolRegistry; llmClient: LLMClient; todoManager: TodoManagerImpl };
  private orchestrator: AgentOrchestrator | null = null;
  private currentPrompt = '';
  private executionStartTime: Date | null = null;
  private disposer: (() => void) | null = null;
  private throttledUpdateThinking: ((stepId: string, content: string) => void) & { cancel?: () => void } | null = null;

  constructor(
    config: AgentConfig,
    channel: { send: (msg: any) => Promise<any> },
    state: AgentState,
    configManager?: ConfigManager,
    contextManager?: ContextManager,
    dependencies?: AgentDependencies
  ) {
    this.config = config;
    this.state = state;
    this.configManager = configManager ?? new ConfigManager(config);
    this.contextManager = contextManager ?? new ContextManager(config);
    this.configManager.setChannel(channel);
    this.contextManager.setChannel(channel);

    const todoManager = dependencies?.todoManager ?? new TodoManagerImpl();
    const llmClient = dependencies?.llmClient ?? new LLMClient({
      apiKey: config.apiKey,
      model: config.model,
      apiBase: config.apiBase,
    });
    const toolRegistry = dependencies?.toolRegistry ?? new ToolRegistry(channel, todoManager);

    this.deps = {
      toolRegistry,
      llmClient,
      todoManager,
    };

    this.state.setTools(this.deps.toolRegistry.getAll());

    this.throttledUpdateThinking = throttle((stepId: string, content: string) => {
      this.state.updateThinkingStepContent(stepId, content);
    }, THROTTLE_DELAY);

    makeAutoObservable(this);
  }

  dispose(): void {
    if (this.throttledUpdateThinking && 'cancel' in this.throttledUpdateThinking) {
      (this.throttledUpdateThinking as any).cancel();
    }
    this.throttledUpdateThinking = null;
    if (this.disposer) {
      this.disposer();
      this.disposer = null;
    }
  }

  getState(): AgentState {
    return this.state;
  }

  updateFileUri(fileUri: string): void {
    this.state.updateFileUri(fileUri);
  }

  updateRootUri(rootUri: string): void {
    this.configManager.updateRootUri(rootUri);
  }

  updateEditorContent(content: string, selection: string): void {
    this.state.updateEditorContent(content, selection);
  }

  async runAgent(prompt: string): Promise<void> {
    if (this.state.isRunning) {
      logger.warn('Agent is already running, ignoring new request');
      return;
    }

    try {
      this.state.setRunning(true);
      this.state.setError(null);
      this.state.clearLog();

      if (this.disposer) {
        this.disposer();
        this.disposer = null;
      }

      runInAction(() => {
        this.currentPrompt = prompt;
        this.executionStartTime = new Date();
        this.state.addMessage({
          role: 'user',
          content: prompt,
        });
      });

      const llmConfig = await this.configManager.fetchLLMConfig();
      if (llmConfig) {
        this.deps.llmClient = new LLMClient({
          apiKey: llmConfig.apiKey,
          model: llmConfig.model,
          apiBase: llmConfig.apiBase,
        });
      }

      const conversationHistory = this.state.conversationHistory.map((msg) => ({
        ...msg,
        timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(String(msg.timestamp)),
      }));

      this.orchestrator = new AgentOrchestrator(this.config, this.deps);

      const disposerStep = this.orchestrator.on('step', (step) => this.state.addStep(step));
      const disposerThinkingChunk = this.orchestrator.on('thinkingChunk', ({ stepId, content }) => {
        this.throttledUpdateThinking?.(stepId, content);
      });
      const disposerStateChange = this.orchestrator.on('stateChange', (state) => {
        this.state.setAgentState(state);
      });
      const disposerMessage = this.orchestrator.on('message', (message) => {
        this.state.addMessage(message);
      });
      const disposerTodoChange = this.orchestrator.on('todoChange', (todos) => {
        this.state.setTodos(todos);
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

      this.state.setRunning(false);
      logger.info('Agent execution completed', {
        steps: this.state.executionLog.length,
        messages: this.state.conversationHistory.length,
      });
    } catch (error) {
      this.state.setRunning(false);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.state.setError(errorMessage);
      logger.error('Agent execution failed', error);
      throw error;
    }
  }

  stopAgent(): void {
    logger.info('Stopping agent');
    this.dispose();
    if (this.orchestrator) {
      this.orchestrator.stop();
    }
    this.state.setRunning(false);
  }

  async saveContext(fileUri: string): Promise<void> {
    await this.contextManager.saveContext(
      fileUri,
      this.state.executionLog,
      this.state.conversationHistory,
      this.state.error,
      this.state.content,
      this.state.selection
    );
  }

  async loadContext(fileUri: string): Promise<unknown> {
    const context = await this.contextManager.loadContext(fileUri);
    if (context) {
      runInAction(() => {
        this.state.updateFileUri(fileUri);
        this.state.setError(context.error ?? null);
        this.state.selection = context.selection ?? '';
        this.state.executionLog = context.executionLog ?? [];
        this.state.conversationHistory = context.conversationHistory ?? [];
      });
    } else {
      runInAction(() => {
        this.state.updateFileUri(fileUri);
        this.state.setError(null);
        this.state.selection = '';
        this.state.executionLog = [];
        this.state.conversationHistory = [];
      });
    }
    return context;
  }

  async saveExecutionState(): Promise<void> {
    await this.contextManager.saveExecutionState(
      this.state.fileUri ?? '',
      this.currentPrompt,
      this.executionStartTime ?? new Date(),
      this.state.isRunning,
      this.state.agentState,
      0,
      this.state.todos,
      this.state.executionLog,
      this.state.conversationHistory,
      this.state.content,
      this.state.selection
    );
    this.state.setSavedState(true);
  }

  async loadExecutionState(): Promise<any> {
    const state = await this.contextManager.loadExecutionState(this.state.fileUri ?? '');
    if (state) {
      this.state.loadExecutionState(state);
    } else {
      this.state.setSavedState(false);
    }
    return state;
  }

  async deleteExecutionState(): Promise<void> {
    await this.contextManager.deleteExecutionState(this.state.fileUri ?? '');
    this.state.setSavedState(false);
  }

  async resumeExecution(): Promise<void> {
    if (this.state.isRunning) {
      logger.warn('Cannot resume execution: agent is already running');
      return;
    }

    const state = await this.loadExecutionState();
    if (!state) {
      throw new Error('No saved execution state found');
    }

    try {
      this.state.setRunning(true);
      this.state.setError(null);

      if (this.disposer) {
        this.disposer();
        this.disposer = null;
      }

      this.orchestrator = new AgentOrchestrator(this.config, this.deps);

      const disposerStep = this.orchestrator.on('step', (step) => this.state.addStep(step));
      const disposerStateChange = this.orchestrator.on('stateChange', (state) => {
        this.state.setAgentState(state);
      });
      const disposerMessage = this.orchestrator.on('message', (message) => {
        this.state.addMessage(message);
      });
      const disposerTodoChange = this.orchestrator.on('todoChange', (todos) => {
        this.state.setTodos(todos);
      });

      this.disposer = () => {
        disposerStep();
        disposerStateChange();
        disposerMessage();
        disposerTodoChange();
      };

      const historyMessages = state.conversationHistory.map((msg: any) => ({
        id: uuid('hist-'),
        role: msg.role as 'user' | 'assistant' | 'system' | 'tool',
        content: msg.content,
        timestamp: new Date(),
      }));

      await this.orchestrator.run(state.prompt, historyMessages, {
        clearTodos: false,
        startIteration: state.currentIteration,
      });

      this.state.setRunning(false);
      logger.info('Agent execution resumed successfully', {
        steps: this.state.executionLog.length,
        messages: this.state.conversationHistory.length,
      });
    } catch (error) {
      this.state.setRunning(false);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.state.setError(errorMessage);
      logger.error('Agent execution resumed failed', error);
      throw error;
    }
  }
}

export default AgentExecutor;
