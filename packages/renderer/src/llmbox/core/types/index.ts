export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: Date;
  toolCallId?: string;
  tool_calls?: ToolCall[];
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export type ToolCallArray = ToolCall[];

export interface Tool {
  name: string;
  description: string;
  parameters: ToolParameters;
  executor: (params: Record<string, unknown>) => Promise<unknown>;
  metadata?: {
    category: 'file' | 'search' | 'custom';
    permission: 'read' | 'write';
    dangerous?: boolean;
  };
}

export interface ToolParameter {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required?: boolean;
  enum?: string[];  // 添加 enum 字段
  default?: unknown;
  items?: ToolParameter;
  properties?: Record<string, ToolParameter>;
}

export interface ToolParameters {
  type: 'object';
  properties: Record<string, ToolParameter>;
  required?: string[];
  [key: string]: unknown;
}

export interface ToolArrayItemSchema {
  type: 'object';
  description?: string;
  properties: Record<string, ToolParameter>;
  required?: string[];
  [key: string]: unknown;
}

export interface ToolArrayParameter {
  type: 'array';
  description: string;
  items: ToolArrayItemSchema;
  [key: string]: unknown;
}

export interface ExecutionStep {
  id: string;
  timestamp: Date;
  type: 'thinking' | 'tool_call' | 'tool_result' | 'final_answer' | 'error' | 'todo_list' | 'todo_create' | 'todo_update';
  content: string;
  toolName?: string;
  toolParams?: Record<string, unknown>;
  toolResult?: unknown;
  error?: string;
  duration?: number;
  todos?: TodoItem[];
}

export interface TodoItem {
  id: string;
  parentId?: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
  updatedAt: Date;
  children?: TodoItem[];
  level?: number;
}

export interface AgentConfig {
  apiKey: string;
  model: string;
  apiBase: string;
  fileUri?: string;
  rootUri?: string;
  maxIterations?: number;
  showThinking?: boolean;
  contextWindowSize?: number;
  compressRatio?: number;
  compressCheckInterval?: number;
  minCompressCheckInterval?: number;
  tokenLimitErrorCodes?: string[];
}

export interface AgentExecutionState {
  prompt: string;
  startTime: Date;
  isRunning: boolean;
  agentState: 'idle' | 'thinking' | 'executing';
  currentIteration: number;
  maxIterations: number;
  todos: TodoItem[];
  executionLog: ExecutionStep[];
  conversationHistory: Array<{ role: string; content: string }>;
  fileUri: string | null;
  rootUri: string | null;
  content: string;
  selection: string;
  savedAt: Date;
}

export type AgentState = 'idle' | 'thinking' | 'executing';

export type {
  LLMApiError,
  isLLMApiError,
  ToolCallResult,
} from '../api/client';
export { DEFAULT_CONFIG, type Config } from '../config';
