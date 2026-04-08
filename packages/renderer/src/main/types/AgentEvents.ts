import type { WorkStep, ToolCall as IMessageToolCall } from './IMessage';

export interface ExecutionStep extends Omit<WorkStep, 'type'> {
  id: string;
  type: 'thinking' | 'response' | 'tool_call' | 'summary' | 'error';
  isCompleted: boolean;
  timestamp: number;
}

export type ToolCall = IMessageToolCall;

export type AgentStepEvent =
  | { type: 'agent-start' }
  | { type: 'agent-complete' }
  | { type: 'agent-error'; error: string }
  | { type: 'step-start'; step: ExecutionStep }
  | { type: 'step-delta'; stepId: string; delta: string }
  | { type: 'step-complete'; stepId: string }
  | { type: 'step-error'; stepId: string; error: string };

export interface AgentMessage {
  id: string;
  role: 'assistant';
  content: string;
  steps: ExecutionStep[];
  isStreaming: boolean;
  timestamp: number;
}
