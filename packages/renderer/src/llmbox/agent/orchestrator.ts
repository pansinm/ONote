import type {
  Tool,
  ExecutionStep,
  TodoItem,
  Message,
  AgentConfig,
  ToolCallResult,
} from '../core/types';
import { LLMClient, LLMApiError, isLLMApiError } from '../core/api/client';
import { DEFAULT_CONFIG } from '../core/config';
import { uuid } from '../../common/tunnel/utils';
import { ToolRegistry } from './tools/registry';
import { TodoManager } from './tools/todo-manager';
import { getLogger } from '/@/shared/logger';

interface AgentDependencies {
  toolRegistry: ToolRegistry;
  llmClient: LLMClient;
  todoManager: TodoManager;
}

type AgentEventType =
  | 'step'
  | 'stateChange'
  | 'message'
  | 'todoChange'
  | 'thinkingChunk'
  | 'error'
  | 'done';

type AgentEventMap = {
  step: ExecutionStep;
  stateChange: 'idle' | 'thinking' | 'executing';
  message: Message;
  todoChange: TodoItem[];
  thinkingChunk: { stepId: string; content: string; isFirst: boolean };
  error: Error;
  done: void;
};

type AgentEventHandler<T extends AgentEventType> = (
  event: AgentEventMap[T]
) => void;

export class AgentOrchestrator {
  private config: AgentConfig;
  private deps: AgentDependencies;
  private abortController: AbortController | null = null;
  private listeners: Map<AgentEventType, Set<AgentEventHandler<AgentEventType>>> =
    new Map();
  private currentIteration = 0;
  private currentThinkingStepId: string | null = null;
  private thinkingContent: string = '';
  private logger = getLogger('AgentOrchestrator');

  constructor(config: AgentConfig, deps: AgentDependencies) {
    this.config = config;
    this.deps = deps;

    this.deps.todoManager.onChange((todos) => {
      this.emit('todoChange', todos);
    });
  }

  on<T extends AgentEventType>(
    event: T,
    handler: AgentEventHandler<T>
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler as AgentEventHandler<AgentEventType>);

    return () => {
      this.listeners.get(event)?.delete(handler as AgentEventHandler<AgentEventType>);
    };
  }

  private emit<T extends AgentEventType>(
    event: T,
    data: AgentEventMap[T]
  ): void {
    this.listeners.get(event)?.forEach((handler) => handler(data));
  }

  async run(
    prompt: string,
    conversationHistory?: Message[],
    options?: { clearTodos?: boolean; startIteration?: number }
  ): Promise<void> {
    this.abortController = new AbortController();
    this.currentIteration = options?.startIteration || 0;
    this.thinkingContent = '';

    if (options?.clearTodos !== false) {
      this.deps.todoManager.clear();
    }

    this.emit('stateChange', 'thinking');
    this.addStep({
      type: 'thinking',
      content: `Starting task: ${prompt}`,
    });

    try {
      const messages = this.buildMessages(prompt, conversationHistory);
      const maxIterations = this.config.maxIterations || 50;
      const tools = this.deps.toolRegistry.getAll();

      while (this.currentIteration < maxIterations && !this.abortController.signal.aborted) {
        this.currentIteration++;

        this.emit('stateChange', 'thinking');
        this.currentThinkingStepId = null;
        this.thinkingContent = '';

        if (this.shouldCompress(messages)) {
          messages.push({
            id: uuid('sys-'),
            role: 'system',
            content: `[Summary of previous conversation]`,
            timestamp: new Date(),
          });
        }

        const stepId = uuid('thinking-');
        this.currentThinkingStepId = stepId;

        const result = await this.deps.llmClient.completeWithStreaming(
          messages,
          {
            signal: this.abortController.signal,
            tools,
          },
          {
            onChunk: (chunk, isFirst) => {
              this.thinkingContent += chunk;
              this.emit('thinkingChunk', { stepId, content: this.thinkingContent, isFirst });
            },
          }
        );

        const assistantMessage: Message = {
          id: uuid('assistant-'),
          role: 'assistant',
          content: result.content,
          timestamp: new Date(),
        };

        this.addStep({
          type: 'thinking',
          content: result.content,
        });

        if (result.toolCalls && result.toolCalls.length > 0) {
          assistantMessage.tool_calls = result.toolCalls.map((tc) => ({
            id: tc.id,
            type: 'function' as const,
            function: {
              name: tc.name,
              arguments: tc.arguments,
            },
          }));

          messages.push(assistantMessage);

          for (const toolCall of result.toolCalls) {
            await this.executeToolCall(toolCall, messages);
          }

          if (this.shouldContinue()) {
            continue;
          } else {
            break;
          }
        } else {
          messages.push(assistantMessage);

          if (!this.shouldContinue()) {
            this.addStep({
              type: 'final_answer',
              content: result.content,
            });
            break;
          }
        }
      }

      this.emit('done', undefined);
      this.emit('stateChange', 'idle');
    } catch (error) {
      this.emit('error', error instanceof Error ? error : new Error(String(error)));
      this.emit('stateChange', 'idle');
      throw error;
    }
  }

  private updateThinkingStep(content: string): void {
    this.thinkingContent = content;
  }

  private async executeToolCall(toolCall: ToolCallResult, messages: Message[]): Promise<void> {
    const startTime = Date.now();

    this.emit('stateChange', 'executing');

    const tool = this.deps.toolRegistry.get(toolCall.name);
    if (!tool) {
      this.logger.warn('Unknown tool requested', { toolName: toolCall.name, params: toolCall.arguments });
      this.addStep({
        type: 'error',
        content: `Unknown tool: ${toolCall.name}`,
        toolName: toolCall.name,
        toolParams: this.parseArguments(toolCall.arguments),
        error: `Tool "${toolCall.name}" not found`,
        duration: Date.now() - startTime,
      });

      messages.push({
        id: uuid('tool-'),
        role: 'tool',
        content: `Error: Tool "${toolCall.name}" not found`,
        toolCallId: toolCall.id,
        timestamp: new Date(),
      });
      return;
    }

    let params: Record<string, unknown>;
    try {
      params = this.parseArguments(toolCall.arguments);
    } catch (error) {
      this.logger.warn('Invalid tool arguments', { toolName: toolCall.name, rawArgs: toolCall.arguments });
      this.addStep({
        type: 'error',
        content: `Invalid arguments for ${toolCall.name}`,
        toolName: toolCall.name,
        error: error instanceof Error ? error.message : 'Invalid arguments',
        duration: Date.now() - startTime,
      });
      return;
    }

    this.logger.info('Executing tool', {
      toolName: toolCall.name,
      params: JSON.stringify(params, null, 2),
    });

    this.addStep({
      type: 'tool_call',
      content: `Using tool: ${toolCall.name}`,
      toolName: toolCall.name,
      toolParams: params,
      duration: Date.now() - startTime,
    });

    let result: unknown;
    try {
      result = await tool.executor(params);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.addStep({
        type: 'tool_call',
        content: `Tool error: ${toolCall.name}`,
        toolName: toolCall.name,
        toolParams: params,
        toolResult: errorMessage,
        error: errorMessage,
        duration: Date.now() - startTime,
      });

      messages.push({
        id: uuid('tool-'),
        role: 'tool',
        content: `Error: ${errorMessage}`,
        toolCallId: toolCall.id,
        timestamp: new Date(),
      });
      return;
    }

    const resultContent = typeof result === 'string' ? result : JSON.stringify(result, null, 2);

    this.addStep({
      type: 'tool_call',
      content: `Tool result: ${toolCall.name}`,
      toolName: toolCall.name,
      toolParams: params,
      toolResult: result,
      duration: Date.now() - startTime,
    });

    messages.push({
      id: uuid('tool-'),
      role: 'tool',
      content: resultContent,
      toolCallId: toolCall.id,
      timestamp: new Date(),
    });

    this.logger.info('Tool executed', {
      toolName: toolCall.name,
      result: typeof result === 'string' ? result : 'JSON result',
      duration: Date.now() - startTime,
    });
  }

  private parseArguments(args: string): Record<string, unknown> {
    if (!args.trim()) return {};
    try {
      return JSON.parse(args);
    } catch {
      return { _raw: args };
    }
  }

  stop(): void {
    if (this.abortController) {
      this.logger.info('Stopping agent');
      this.abortController.abort();
      this.addStep({
        type: 'thinking',
        content: 'Agent stopped by user',
      });
      this.emit('stateChange', 'idle');
    }
  }

  private buildMessages(
    prompt: string,
    history?: Message[]
  ): Message[] {
    const systemMessage: Message = {
      id: uuid('sys-'),
      role: 'system',
      content: this.buildSystemPrompt(),
      timestamp: new Date(),
    };

    const userMessage: Message = {
      id: uuid('user-'),
      role: 'user',
      content: prompt,
      timestamp: new Date(),
    };

    if (history && history.length > 0) {
      return [systemMessage, ...history.filter((m) => m.role !== 'tool'), userMessage];
    }

    return [systemMessage, userMessage];
  }

  private buildSystemPrompt(): string {
    const tools = this.deps.toolRegistry.getAll();
    const toolDescriptions = tools
      .filter((t) => t.name !== 'listTodos')
      .map((t) => `  - ${t.name}: ${t.description}`)
      .join('\n');

    return `
当前时间：${new Date().toLocaleString('zh-CN')}

你是一名智能助手，帮助用户在 ONote 笔记应用中高效完成各种任务。

## 可用工具

${toolDescriptions}

## 工作原则

1. **快速响应优先**：在回答前，先判断问题是否可以基于现有信息直接回答。
2. **优先使用当前文件**：如果 Context 中已提供当前文件内容，优先使用这些内容。
3. **默认目录**：Working Directory 是当前文件所在的目录。
4. **目标导向**：始终以完成任务为目标。
5. **安全第一**：谨慎使用 writeFile、deleteFile 等危险操作，必要时确认。
6. **高效执行**：避免重复调用相同工具。
7. **清晰解释**：在使用工具前说明意图，使用后解释结果。

## 任务流程

1. 分析需求
2. 检查上下文
3. 判断任务类型
4. 选择合适的工具
5. 执行操作
6. 总结结果

## 重要提示

- **直接回答优先**：如果问题可以根据 Context 中的信息直接回答，立即给出答案
- **文件内容使用**：优先使用 Context 中的文件内容
- **目录查询优先**：用户请求列出文件时，默认使用 Working Directory
- **文件 URI 格式**：必须是完整路径
- **参数 JSON 格式**：arguments 字段必须是 JSON 字符串
- **任务完成**：如果创建了任务列表，必须完成所有任务才能结束
- **迭代限制**：最多迭代 ${this.config.maxIterations || 50} 次
    `.trim();
  }

  private shouldCompress(messages: Message[]): boolean {
    const config = DEFAULT_CONFIG;
    const totalChars = messages.reduce((sum, m) => sum + m.content.length, 0);
    const estimatedTokens = Math.ceil(totalChars / 3);
    const threshold = config.agent.contextWindow * 0.8;

    return estimatedTokens >= threshold;
  }

  private shouldContinue(): boolean {
    const todos = this.deps.todoManager.listTodos();
    return todos.length > 0 && !this.deps.todoManager.isAllCompleted();
  }

  private addStep(step: Omit<ExecutionStep, 'id' | 'timestamp'>): void {
    this.emit('step', {
      id: uuid('step-'),
      timestamp: new Date(),
      ...step,
    });
  }
}
