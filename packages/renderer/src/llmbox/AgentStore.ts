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
import { AgentState } from './AgentState';
import { ConfigManager } from './ConfigManager';
import { ContextManager } from './ContextManager';
import { AgentExecutor } from './AgentExecutor';

const logger = getLogger('AgentStore');

interface Channel {
  send: (message: {
    type: string;
    data: unknown;
  }) => Promise<Record<string, unknown>>;
}

export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: Date;
  toolCallId?: string;
  tool_calls?: ToolCall[];
}

export class AgentStore {
  private state: AgentState;
  private configManager: ConfigManager;
  private contextManager: ContextManager;
  private executor: AgentExecutor;

  constructor(config: AgentConfig, channel: Channel) {
    this.state = new AgentState();
    this.configManager = new ConfigManager(config);
    this.contextManager = new ContextManager(config);
    this.configManager.setChannel(channel);
    this.contextManager.setChannel(channel);
    this.executor = new AgentExecutor(
      config,
      channel,
      this.state,
      this.configManager,
      this.contextManager
    );

    makeAutoObservable(this);
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

  get conversationHistory(): AgentMessage[] {
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

  async fetchLLMConfig(): Promise<{ apiKey: string; model: string; apiBase: string } | null> {
    return this.configManager.fetchLLMConfig();
  }

  addMessage(message: { role: string; content: string; toolCallId?: string; tool_calls?: unknown[] }): void {
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

  async runAgent(prompt: string, options?: { clearTodos?: boolean; clearLog?: boolean }): Promise<void> {
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

  async loadExecutionState(): Promise<AgentExecutionState | null> {
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
