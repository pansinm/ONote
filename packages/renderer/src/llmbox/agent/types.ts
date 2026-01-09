/**
 * Agent 功能类型定义
 */

export type TodoStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface TodoItem {
  id: string;
  parentId?: string;
  description: string;
  status: TodoStatus;
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
  updatedAt: Date;
  children?: TodoItem[];
  level?: number;
}

/**
 * 工具定义
 */
export interface Tool {
  /** 工具名称 (唯一标识符) */
  name: string;
  /** 工具描述 (用于 LLM 理解工具用途) */
  description: string;
  /** 参数定义 (JSON Schema 格式) */
  parameters: {
    type: 'object';
    properties: Record<string, ToolParameter>;
    required?: string[];
  };
  /** 工具执行器 */
  executor: (params: Record<string, unknown>) => Promise<unknown>;
  /** 工具元数据 */
  metadata?: {
    /** 工具分类 */
    category: 'file' | 'search' | 'custom';
    /** 权限级别 */
    permission: 'read' | 'write';
    /** 是否危险操作 */
    dangerous?: boolean;
    /** 超时时间 (毫秒) */
    timeout?: number;
  };
}

/**
 * 工具参数定义
 */
export interface ToolParameter {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required?: boolean;
  enum?: string[];
  default?: unknown;
}

/**
 * 工具调用 (OpenAI 格式)
 */
export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string; // JSON string
  };
}

/**
 * 执行步骤 (用于 UI 显示)
 */
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

/**
 * Agent 配置
 */
export interface AgentConfig {
  apiKey: string;
  model: string;
  apiBase: string;
  fileUri?: string;
  rootUri?: string;
  /** 最大迭代次数 */
  maxIterations?: number;
  /** 是否启用思考显示 */
  showThinking?: boolean;
  /** 超时时间 (毫秒) */
  timeout?: number;
  /** 上下文窗口大小（tokens，默认 128000） */
  contextWindowSize?: number;
  /** 压缩比例（默认 0.3，保留 30%） */
  compressRatio?: number;
  /** 最小压缩阈值（默认 20） */
  compressMinMessages?: number;
  /** 初始压缩检查间隔（默认 10） */
  compressCheckInterval?: number;
  /** 最小压缩检查间隔（默认 5） */
  minCompressCheckInterval?: number;
  /** Token 限制错误码 */
  tokenLimitErrorCodes?: string[];
}

/**
 * Agent 执行状态（用于中断恢复）
 */
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
