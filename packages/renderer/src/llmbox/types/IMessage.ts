/**
 * 1. 能够区分是用户发送/Agent回复
 * 2. Agent回复的消息支持显示工作步骤
 * 3. 工作步骤包含多步：
 *     - 思考
 *     - 工具调用
 *     - 总结
 */

export type MessageRole = 'user' | 'assistant' | 'system' | 'session_divider';

export type StepType = 'thinking' | 'tool_call' | 'summary';

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
  result?: string;
}

export interface WorkStep {
  type: StepType;
  content: string;
  toolCalls?: ToolCall[];
  isCompleted?: boolean;
}

export interface AgentMessage extends BaseMessage {
  role: 'assistant';
  steps: WorkStep[];
  isStreaming?: boolean;
}

export interface UserMessage extends BaseMessage {
  role: 'user';
}

export interface SessionDividerMessage {
  id: string;
  role: 'session_divider';

  // Session标识
  sessionId: string;

  // Session元信息
  title?: string;           // 标题，默认"会话分割"
  description?: string;     // 描述信息

  // 时间范围
  startTime: number;        // 开始时间
  endTime?: number;         // 结束时间（可选）

  // 统计信息
  messageCount: number;     // 该session的消息数量

  // 组织和展示
  tags?: string[];          // 标签数组
  icon?: 'folder' | 'calendar' | 'tag' | 'bookmark' | 'clock' | 'chat'; // 图标类型
  color?: string;           // 主题色

  // 排序用
  timestamp: number;
}

export type Message = UserMessage | AgentMessage | SessionDividerMessage;
