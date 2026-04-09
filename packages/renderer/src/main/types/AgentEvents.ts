import type { ConversationStep, ToolCall as IMessageToolCall } from './IMessage';

export interface ExecutionStep extends ConversationStep {
  id: string;
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
  steps: ConversationStep[];
  isStreaming: boolean;
  timestamp: number;
}
