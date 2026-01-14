import { makeAutoObservable } from 'mobx';
import type {
  ExecutionStep,
  AgentConfig,
  TodoItem,
  Tool,
  Message,
} from '../types';
import { getLogger } from '/@/shared/logger';
import { AgentState } from './AgentState';
import { ConfigManager } from '../service/ConfigManager';
import { ContextManager } from '../service/ContextManager';
import { AgentExecutor } from '../agent/AgentExecutor';
import type { Channel } from '../ipc';

const logger = getLogger('AgentStore');

let agentStoreInstance: AgentStore | null = null;

export class AgentStore {
  private state: AgentState;
  private configManager: ConfigManager;
  private contextManager: ContextManager;
  private executor: AgentExecutor;

  private constructor(config: AgentConfig, channel: Channel) {
    this.state = new AgentState();
    this.configManager = new ConfigManager(config);
    this.contextManager = new ContextManager(config);
    this.executor = new AgentExecutor(
      config,
      channel,
      this.state,
      this.configManager,
      this.contextManager,
    );

    makeAutoObservable(this);
  }

  static getInstance(config?: AgentConfig, channel?: Channel): AgentStore {
    if (!agentStoreInstance) {
      if (!config || !channel) {
        throw new Error(
          'AgentStore.getInstance() requires config and channel on first call',
        );
      }
      agentStoreInstance = new AgentStore(config, channel);
    }
    return agentStoreInstance;
  }

  configure(config: AgentConfig): void {
    this.configManager.updateRootUri(config.rootUri || '');
    this.configManager = new ConfigManager(config);
    this.contextManager = new ContextManager(config);
  }

  get todos(): TodoItem[] {
    return this.state.todos;
  }

  get tools(): Tool[] {
    return this.state.tools;
  }

  get executionLog(): ExecutionStep[] {
    return this.state.executionLog;
  }

  get conversationHistory(): Message[] {
    return this.state.conversationHistory;
  }

  get agentState(): 'idle' | 'thinking' | 'executing' {
    return this.state.agentState;
  }

  get error(): string | null {
    return this.state.error;
  }

  get isRunning(): boolean {
    return this.state.isRunning;
  }

  get hasSavedState(): boolean {
    return this.state.hasSavedState;
  }

  get lastStateSavedAt(): Date | null {
    return this.state.lastStateSavedAt;
  }

  get fileUri(): string | null {
    return this.state.fileUri;
  }

  get content(): string {
    return this.state.content;
  }

  get selection(): string {
    return this.state.selection;
  }

  loadTools(): void {
    this.state.setTools([]);
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

  async fetchLLMConfig(): Promise<{
    apiKey: string;
    model: string;
    apiBase: string;
  } | null> {
    return this.configManager.fetchLLMConfig();
  }

  addMessage(message: {
    role: string;
    content: string;
    toolCallId?: string;
    tool_calls?: unknown[];
  }): void {
    this.state.addMessage(message as any);
  }

  addStep(step: Omit<ExecutionStep, 'id' | 'timestamp'>): string {
    return this.state.addStep(step);
  }

  updateThinkingStepContent(stepId: string, content: string): void {
    this.state.updateThinkingStepContent(stepId, content);
  }

  clearLog(): void {
    this.state.clearLog();
  }

  clearConversation(): void {
    this.state.clearConversation();
  }

  setError(error: string | null): void {
    this.state.setError(error);
  }

  setRunning(running: boolean): void {
    this.state.setRunning(running);
  }

  clearError(): void {
    this.state.setError(null);
  }

  stopAgent(): void {
    this.executor.stopAgent();
  }

  async runAgent(
    prompt: string,
    options?: { clearTodos?: boolean; clearLog?: boolean },
  ): Promise<void> {
    await this.executor.runAgent(prompt, options);
  }

  async saveContext(fileUri: string): Promise<void> {
    await this.executor.saveContext(fileUri);
  }

  async loadContext(fileUri: string): Promise<unknown> {
    return this.executor.loadContext(fileUri);
  }

  isConversationHistoryEmpty(): boolean {
    return this.state.isConversationHistoryEmpty();
  }

  isExecutionLogEmpty(): boolean {
    return this.state.isExecutionLogEmpty();
  }

  async saveExecutionState(): Promise<void> {
    await this.executor.saveExecutionState();
  }

  async loadExecutionState(): Promise<unknown> {
    return this.executor.loadExecutionState();
  }

  async resumeExecution(): Promise<void> {
    await this.executor.resumeExecution();
  }

  async deleteExecutionState(): Promise<void> {
    await this.executor.deleteExecutionState();
  }
}

export default AgentStore;
