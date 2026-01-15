import { makeAutoObservable, runInAction } from 'mobx';
import type {
  ExecutionStep,
  AgentConfig,
  TodoItem,
  Tool,
  Message,
  PersistedContext,
  PersistedExecutionState,
} from '../types';
import { getLogger } from '/@/shared/logger';
import { LLM_BOX_MESSAGE_TYPES } from '../utils/constants';
import { channel } from '../ipc';

const logger = getLogger('Store');

export class Store {
  // ============================================================================
  // 状态
  // ============================================================================
  todos: TodoItem[] = [];
  tools: Tool[] = [];
  steps: ExecutionStep[] = [];
  conversationHistory: Message[] = [];
  agentState: 'idle' | 'thinking' | 'executing' = 'idle';
  error: string | null = null;
  isRunning = false;
  hasSavedState = false;
  lastStateSavedAt: Date | null = null;
  fileUri = '';
  content = '';
  selection = '';

  // ============================================================================
  // 私有字段
  // ============================================================================
  private config: AgentConfig = {
    apiBase: '',
    apiKey: '',
    model: '',
    rootUri: '',
  };

  constructor() {
    makeAutoObservable(this);
  }

  getConfig(): AgentConfig {
    return {
      ...this.config,
      fileUri: this.fileUri!,
      rootUri: this.config.rootUri,
    };
  }

  updateRootUri(rootUri: string): void {
    runInAction(() => {
      this.config = { ...this.config, rootUri };
    });
  }

  // ============================================================================
  // 文件和编辑器状态
  // ============================================================================
  updateFileUri(fileUri: string): void {
    runInAction(() => {
      this.fileUri = fileUri;
    });
  }

  updateEditorContent(content: string, selection: string): void {
    runInAction(() => {
      this.content = content;
      this.selection = selection;
    });
  }

  // ============================================================================
  // 工具管理
  // ============================================================================
  loadTools(): void {
    runInAction(() => {
      this.tools = [];
    });
  }

  // ============================================================================
  // 消息和日志
  // ============================================================================
  addMessage(message: {
    role: string;
    content: string;
    toolCallId?: string;
    tool_calls?: unknown[];
  }): Message {
    const newMessage: Message = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      role: message.role as Message['role'],
    } as Message;

    runInAction(() => {
      this.conversationHistory.push(newMessage);
    });

    return newMessage;
  }

  addStep<T extends Omit<ExecutionStep, 'id' | 'timestamp'>>(step: T): string {
    const stepId = crypto.randomUUID();
    runInAction(() => {
      this.steps.push({
        ...step,
        id: stepId,
        timestamp: Date.now(),
      } as any);
    });
    return stepId;
  }

  updateThinkingStepContent(stepId: string, content: string): void {
    runInAction(() => {
      const step = this.steps.find((s) => s.id === stepId);
      if (step && step.type === 'thinking') {
        (step as any).content = content;
      }
    });
  }

  clearLog(): void {
    runInAction(() => {
      this.steps = [];
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

  // ============================================================================
  // Todos
  // ============================================================================
  setTodos(todos: TodoItem[]): void {
    runInAction(() => {
      this.todos = todos;
    });
  }

  // ============================================================================
  // 执行状态
  // ============================================================================
  setAgentState(state: 'idle' | 'thinking' | 'executing'): void {
    runInAction(() => {
      this.agentState = state;
    });
  }

  setSavedState(hasSaved: boolean): void {
    runInAction(() => {
      this.hasSavedState = hasSaved;
      if (hasSaved) {
        this.lastStateSavedAt = new Date();
      } else {
        this.lastStateSavedAt = null;
      }
    });
  }

  loadExecutionState(state: {
    todos: TodoItem[];
    steps: ExecutionStep[];
  }): void {
    runInAction(() => {
      this.todos = state.todos;
      this.steps = state.steps;
      this.hasSavedState = true;
    });
  }

  isConversationHistoryEmpty(): boolean {
    return this.conversationHistory.length === 0;
  }

  isStepsEmpty(): boolean {
    return this.steps.length === 0;
  }

  // ============================================================================
  // 上下文持久化
  // ============================================================================
  async saveContext(fileUri: string): Promise<void> {
    const contextToSave: PersistedContext = {
      version: 1,
      savedAt: Date.now(),
      fileUri,
      messages: this.conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      steps: this.steps,
    };

    try {
      const response = (await channel.send({
        type: LLM_BOX_MESSAGE_TYPES.AGENT_CONTEXT_SAVE,
        data: {
          fileUri,
          rootUri: this.config.rootUri,
          context: contextToSave,
        },
      })) as { error?: string } | undefined;

      if (response?.error) {
        throw new Error(String(response.error));
      }

      logger.info('Agent context saved', {
        fileUri,
        messageCount: this.conversationHistory.length,
      });
    } catch (error) {
      logger.error('Failed to save agent context', error);
      throw error;
    }
  }

  async loadContext(fileUri: string): Promise<PersistedContext | null> {
    if (!this.config.rootUri) {
      logger.warn('Cannot load agent context: missing rootUri');
      return null;
    }

    try {
      const response = (await channel.send({
        type: LLM_BOX_MESSAGE_TYPES.AGENT_CONTEXT_LOAD,
        data: { fileUri, rootUri: this.config.rootUri },
      })) as { error?: string; agentContext?: PersistedContext } | undefined;

      if (!response || response.error) {
        logger.error('Failed to load agent context', response?.error);
        return null;
      }

      const agentContext = response.agentContext;

      // 向后兼容：如果旧数据使用 executionLog 字段，则迁移到 steps
      let context = agentContext ?? null;
      if (context && (context as any).executionLog) {
        context = {
          ...context,
          steps: (context as any).executionLog,
        };
      }

      logger.info('Agent context loaded', {
        fileUri,
        hasContext: !!context,
        messageCount: context?.messages?.length ?? 0,
        stepsLength: context?.steps?.length ?? 0,
      });

      return context;
    } catch (error) {
      logger.error('Failed to load agent context', error);
      return null;
    }
  }

  async saveExecutionState(
    prompt: string,
    startTime: Date,
    currentIteration: number,
  ): Promise<void> {
    if (!this.config.rootUri || !this.fileUri) {
      logger.debug('Cannot save execution state: missing rootUri or fileUri');
      return;
    }

    const state = {
      version: 1,
      savedAt: Date.now(),
      fileUri: this.fileUri,
      prompt,
      startTime: startTime.getTime(),
      iteration: currentIteration,
      agentState: this.agentState,
      todos: this.todos,
      steps: this.steps,
    };

    try {
      await channel.send({
        type: LLM_BOX_MESSAGE_TYPES.AGENT_EXECUTION_STATE_SAVE,
        data: {
          fileUri: this.fileUri,
          rootUri: this.config.rootUri,
          state,
        },
      });

      logger.info('Execution state saved successfully', {
        fileUri: this.fileUri,
      });
    } catch (error) {
      logger.error('Failed to save execution state', error);
      throw error;
    }
  }

  async deleteExecutionState(): Promise<void> {
    if (!this.config.rootUri || !this.fileUri) {
      logger.warn('Cannot delete execution state: missing rootUri or fileUri');
      return;
    }

    try {
      await channel.send({
        type: LLM_BOX_MESSAGE_TYPES.AGENT_EXECUTION_STATE_DELETE,
        data: {
          fileUri: this.fileUri,
          rootUri: this.config.rootUri,
        },
      });

      logger.info('Execution state deleted successfully', {
        fileUri: this.fileUri,
      });
    } catch (error) {
      logger.error('Failed to delete execution state', error);
      throw error;
    }
  }

  async fetchExecutionState(): Promise<PersistedExecutionState | null> {
    if (!this.config.rootUri || !this.fileUri) {
      logger.warn('Cannot fetch execution state: missing rootUri or fileUri');
      return null;
    }

    try {
      const response = (await channel.send({
        type: LLM_BOX_MESSAGE_TYPES.AGENT_EXECUTION_STATE_LOAD,
        data: {
          fileUri: this.fileUri,
          rootUri: this.config.rootUri,
        },
      })) as { state?: PersistedExecutionState };

      if (!response || !response.state) {
        return null;
      }

      return response.state;
    } catch (error) {
      logger.error('Failed to fetch execution state', error);
      return null;
    }
  }
}

export default Store;
