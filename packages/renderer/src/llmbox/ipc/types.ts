import type { LLMBoxMessageType } from '../utils/constants';
import type { ExecutionStep, TodoItem } from '../types';

// ============================================================================
// 消息类型映射 - 将消息类型与数据类型、响应类型关联
// ============================================================================

/**
 * 每个消息类型的数据和响应类型定义
 */
export interface MessageTypes {
  // 编辑器事件
  EDITOR_FILE_OPEN: {
    data: { uri: string; rootUri: string };
    response: undefined;
  };
  EDITOR_CONTENT_CHANGED: {
    data: { content: string; fileUri: string };
    response: undefined;
  };
  EDITOR_SELECTION_CHANGED: {
    data: { selection: string };
    response: undefined;
  };

  // 对话管理
  LLM_CONVERSATION_LOAD: {
    data: { fileUri: string };
    response: { messages: unknown[] } | { error: string };
  };
  LLM_CONVERSATION_SAVE: {
    data: { fileUri: string; messages: unknown[] };
    response: { success: boolean } | { error: string };
  };

  // 文件操作
  AGENT_FILE_READ: {
    data: { uri: string };
    response: { content: string } | { error: string };
  };
  AGENT_FILE_WRITE: {
    data: { uri: string; content: string };
    response: { success: boolean } | { error: string };
  };
  AGENT_FILE_REPLACE: {
    data: {
      uri: string;
      operations: Array<{
        mode: 'string' | 'regex' | 'line_range' | 'line_number';
        search: string;
        replace: string;
        replaceAll?: boolean;
        caseSensitive?: boolean;
        lineStart?: number;
        lineEnd?: number;
      }>;
      preview?: boolean;
    };
    response: {
      success: boolean;
      modifiedLines: number[];
      operations: Array<{
        success: boolean;
        matches: number;
        changedLines: number[];
        error?: string;
      }>;
      preview?: string;
    } | { error: string };
  };
  AGENT_FILE_CREATE: {
    data: { uri: string; content?: string };
    response: { success: boolean } | { error: string };
  };
  AGENT_FILE_DELETE: {
    data: { uri: string };
    response: { success: boolean } | { error: string };
  };
  AGENT_FILE_LIST: {
    data: { uri: string };
    response: {
      files: Array<{
        name: string;
        uri: string;
        isDirectory: boolean;
      }>;
    } | { error: string };
  };
  AGENT_FILE_SEARCH: {
    data: { rootUri: string; keywords: string };
    response: {
      results: Array<{
        name: string;
        uri: string;
        isDirectory: boolean;
      }>;
    } | { error: string };
  };
  AGENT_FILE_SEARCH_IN: {
    data: { uri: string; pattern: string };
    response: {
      matches: Array<{ line: number; text: string }>;
      count: number;
    } | { error: string };
  };

  // Agent 状态同步
  AGENT_GET_ROOT_URI: {
    data: undefined;
    response: { rootUri: string } | { error: string };
  };
  AGENT_GET_ACTIVE_FILE_URI: {
    data: undefined;
    response: { fileUri: string } | { error: string };
  };
  GET_CURRENT_FILE_INFO: {
    data: undefined;
    response: {
      fileUri: string;
      rootUri: string;
      content: string;
    } | { error: string };
  };

  // Agent 上下文持久化
  AGENT_CONTEXT_LOAD: {
    data: { fileUri: string; rootUri: string };
    response: {
      agentContext?: {
        version: number;
        savedAt: number;
        fileUri: string;
        messages: Array<{ role: string; content: string }>;
        steps: ExecutionStep[];
      };
      error?: string;
    };
  };
  AGENT_CONTEXT_SAVE: {
    data: {
      fileUri: string;
      rootUri: string;
      context: {
        version: number;
        savedAt: number;
        fileUri: string;
        messages: Array<{ role: string; content: string }>;
        steps: ExecutionStep[];
      };
    };
    response: { error?: string } | undefined;
  };

  // Agent 执行状态持久化
  AGENT_EXECUTION_STATE_LOAD: {
    data: { fileUri: string; rootUri: string };
    response: {
      state?: {
        version: number;
        savedAt: number;
        fileUri: string;
        prompt: string;
        startTime: number;
        iteration: number;
        agentState: 'idle' | 'thinking' | 'executing';
        todos: TodoItem[];
        steps: ExecutionStep[];
      };
    } | { error: string };
  };
  AGENT_EXECUTION_STATE_SAVE: {
    data: {
      fileUri: string;
      rootUri: string;
      state: {
        version: number;
        savedAt: number;
        fileUri: string;
        prompt: string;
        startTime: number;
        iteration: number;
        agentState: 'idle' | 'thinking' | 'executing';
        todos: TodoItem[];
        steps: ExecutionStep[];
      };
    };
    response: { error?: string } | undefined;
  };
  AGENT_EXECUTION_STATE_DELETE: {
    data: { fileUri: string; rootUri: string };
    response: { error?: string } | undefined;
  };

  // LLM 配置
  LLM_CONFIG_GET: {
    data: undefined;
    response: {
      apiKey: string;
      model: string;
      apiBase: string;
    } | { error: string };
  };
}

// ============================================================================
// 类型提取工具
// ============================================================================

/**
 * 提取消息类型的数据类型
 */
export type MessageData<T extends LLMBoxMessageType> =
  T extends keyof MessageTypes
    ? MessageTypes[T]['data']
    : unknown;

/**
 * 提取消息类型的响应类型
 */
export type MessageResponse<T extends LLMBoxMessageType> =
  T extends keyof MessageTypes
    ? MessageTypes[T]['response']
    : unknown;

// ============================================================================
// 消息接口
// ============================================================================

export interface TypedMessage<T extends LLMBoxMessageType> {
  type: T;
  data: MessageData<T>;
  metadata?: {
    requestId: string;
    timestamp: number;
  };
}

export interface TypedResponse<T extends LLMBoxMessageType> {
  type: T;
  data: MessageResponse<T>;
  metadata?: {
    requestId: string;
    duration: number;
  };
}

// ============================================================================
// 选项和配置
// ============================================================================

export interface SendOptions {
  timeout?: number;        // 请求超时时间（毫秒），默认 30000
  retry?: number;          // 重试次数，默认 0
  retryDelay?: number;     // 重试延迟（毫秒），默认 1000
  requestId?: string;      // 自定义请求 ID
}

// ============================================================================
// 通用类型
// ============================================================================

export type LLMBoxMessage = {
  type: LLMBoxMessageType;
  data: unknown;
  metadata?: {
    requestId: string;
    timestamp: number;
  };
};

export type LLMBoxResponse = Record<string, unknown> | undefined;
