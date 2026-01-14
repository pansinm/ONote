import type { TodoItem } from './todo';
import type { ExecutionStep } from './execution-step';

export interface PersistedContext {
  version: 1;
  savedAt: number;
  fileUri: string;
  messages: Array<{ role: string; content: string }>;
  executionLog: ExecutionStep[];
}

export interface PersistedExecutionState {
  version: 1;
  savedAt: number;
  fileUri: string;
  prompt: string;
  startTime: number;
  iteration: number;
  agentState: 'idle' | 'thinking' | 'executing';
  todos: TodoItem[];
  steps: ExecutionStep[];
}
