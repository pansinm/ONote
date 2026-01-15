// ============================================================================
// 核心配置类型
// ============================================================================

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
  tokenLimitError?: string[];
}

export interface Config {
  llm: {
    apiBase: string;
    model: string;
    timeout: number;
  };
  agent: {
    maxIterations: number;
    compressRatio: number;
    contextWindow: number;
    compressCheckInterval: number;
    minCompressCheckInterval: number;
  };
}

export const DEFAULT_CONFIG: Config = {
  llm: {
    apiBase: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o',
    timeout: 60000,
  },
  agent: {
    maxIterations: 50,
    compressRatio: 0.3,
    contextWindow: 128000,
    compressCheckInterval: 10,
    minCompressCheckInterval: 5,
  },
};

// ============================================================================
// 消息类型
// ============================================================================

export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

export interface BaseMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
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

// ============================================================================
// 执行步骤类型
// ============================================================================

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

// ============================================================================
// 待办事项类型
// ============================================================================

export interface TodoItem {
  id: string;
  parentId?: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: 'high' | 'medium' | 'low';
  createdAt: number;
  updatedAt: number;
  children?: TodoItem[];
  level?: number;
}

// ============================================================================
// 工具类型
// ============================================================================

export interface ToolParameter {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required?: boolean;
  enum?: string[];
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

// ============================================================================
// 持久化类型
// ============================================================================

export interface PersistedContext {
  version: 1;
  savedAt: number;
  fileUri: string;
  messages: Array<{ role: string; content: string }>;
  steps: ExecutionStep[];
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
