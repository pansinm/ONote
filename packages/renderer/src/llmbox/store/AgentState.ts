import { makeAutoObservable, runInAction } from 'mobx';
import {
  ExecutionStep,
  TodoItem,
  Tool,
  ExecutionStepType,
  ThinkingStep,
} from '../types';
import type { Message } from '../types';

export class AgentState {
  todos: TodoItem[] = [];
  tools: Tool[] = [];
  executionLog: ExecutionStep[] = [];
  conversationHistory: Message[] = [];
  agentState: 'idle' | 'thinking' | 'executing' = 'idle';
  error: string | null = null;
  isRunning = false;
  hasSavedState = false;
  lastStateSavedAt: Date | null = null;
  fileUri: string | null = null;
  content = '';
  selection = '';

  constructor() {
    makeAutoObservable(this);
  }

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

  setTools(tools: Tool[]): void {
    runInAction(() => {
      this.tools = tools;
    });
  }

  addMessage(message: Omit<Message, 'id' | 'timestamp'>): Message {
    const newMessage: Message = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    runInAction(() => {
      this.conversationHistory.push(newMessage);
    });
    return newMessage;
  }

  addStep(step: Omit<ExecutionStep, 'id' | 'timestamp'>): string {
    const stepId = crypto.randomUUID();
    runInAction(() => {
      this.executionLog.push({
        ...step,
        id: stepId,
        timestamp: Date.now(),
      } as ExecutionStep);
    });
    return stepId;
  }

  updateThinkingStepContent(stepId: string, content: string): void {
    runInAction(() => {
      const step = this.executionLog.find((s) => s.id === stepId);
      if (step && step.type === 'thinking') {
        (step as ThinkingStep).content = content;
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

  setAgentState(state: 'idle' | 'thinking' | 'executing'): void {
    runInAction(() => {
      this.agentState = state;
    });
  }

  setTodos(todos: TodoItem[]): void {
    runInAction(() => {
      this.todos = todos;
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

  loadExecutionState(state: { todos: TodoItem[]; steps: ExecutionStep[] }): void {
    runInAction(() => {
      this.todos = state.todos;
      this.executionLog = state.steps;
      this.hasSavedState = true;
    });
  }

  isConversationHistoryEmpty(): boolean {
    return this.conversationHistory.length === 0;
  }

  isExecutionLogEmpty(): boolean {
    return this.executionLog.length === 0;
  }
}

export default AgentState;
