export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

export interface BaseMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
}

export interface ToolMessage extends BaseMessage {
  role: 'tool';
  toolCallId: string;
  toolName: string;
  result?: unknown;
  error?: string;
}

export interface AssistantMessage extends BaseMessage {
  role: 'assistant';
  toolCalls?: ToolCall[];
}

export type Message = BaseMessage | ToolMessage | AssistantMessage;

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}
