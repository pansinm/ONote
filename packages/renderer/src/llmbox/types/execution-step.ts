import type { TodoItem } from './todo';

export interface BaseStep {
  id: string;
  timestamp: number;
  duration?: number;
}

export interface ThinkingStep extends BaseStep {
  type: 'thinking';
  content: string;
  isStreaming?: boolean;
}

export interface ToolCallStep extends BaseStep {
  type: 'tool_call';
  toolCallId: string;
  toolName: string;
  params: Record<string, unknown>;
}

export interface ToolResultStep extends BaseStep {
  type: 'tool_result';
  toolCallId: string;
  success: boolean;
  result?: unknown;
  error?: string;
}

export interface TodoStep extends BaseStep {
  type: 'todo';
  todos: TodoItem[];
}

export interface FinalAnswerStep extends BaseStep {
  type: 'final_answer';
  content: string;
}

export interface ErrorStep extends BaseStep {
  type: 'error';
  message: string;
  recoverable: boolean;
}

export type ExecutionStep =
  | ThinkingStep
  | ToolCallStep
  | ToolResultStep
  | TodoStep
  | FinalAnswerStep
  | ErrorStep;

export type ExecutionStepType = ExecutionStep['type'];
