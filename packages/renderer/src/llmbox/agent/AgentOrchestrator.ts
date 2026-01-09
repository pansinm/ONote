import type { ToolCall, AgentConfig, ExecutionStep, TodoItem } from './types';
import ToolRegistry from './ToolRegistry';
import { getLogger } from '../../shared/logger';
import { uuid } from '../../common/tunnel/utils';
import type TodoManager from './TodoManager';

const logger = getLogger('AgentOrchestrator');

interface AgentOrchestratorOptions {
  config: AgentConfig;
  toolRegistry: ToolRegistry;
  onStep: (step: ExecutionStep) => void;
  onStateChange: (state: 'idle' | 'thinking' | 'executing') => void;
  onMessage?: (message: { role: 'assistant' | 'user' | 'system' | 'tool'; content: string }) => void;
  onTodoChange?: (todos: TodoItem[]) => void;
  onTodoAction?: (action: 'create' | 'update', todo?: TodoItem) => void;
  onSaveState?: () => Promise<void>;
}

export class AgentOrchestrator {
  private config: AgentConfig;
  private toolRegistry: ToolRegistry;
  private abortController: AbortController | null = null;
  private onStep: (step: ExecutionStep) => void;
  private onStateChange: (state: 'idle' | 'thinking' | 'executing') => void;
  private onMessage?: (message: { role: 'assistant' | 'user' | 'system' | 'tool'; content: string }) => void;
  private onTodoChange?: (todos: TodoItem[]) => void;
  private onTodoAction?: (action: 'create' | 'update', todo?: TodoItem) => void;
  private onSaveState?: () => Promise<void>;
  private todoManager: TodoManager;
  private dynamicCompressCheckInterval?: number;

  constructor(options: AgentOrchestratorOptions, todoManager: TodoManager) {
    this.config = options.config;
    this.toolRegistry = options.toolRegistry;
    this.onStep = options.onStep;
    this.onStateChange = options.onStateChange;
    this.onMessage = options.onMessage;
    this.onTodoChange = options.onTodoChange;
    this.onTodoAction = options.onTodoAction;
    this.onSaveState = options.onSaveState;
    this.todoManager = todoManager;

    this.todoManager.registerCallback((todos) => {
      if (this.onTodoChange) {
        this.onTodoChange(todos);
      }
    });
  }

  /**
   * 运行 Agent
   * @param prompt - 当前任务提示
   * @param conversationHistory - 对话历史（可选）
   * @param options - 运行选项
   */
  async run(
    prompt: string,
    conversationHistory?: Array<{ role: string; content: string }>,
    options?: { clearTodos?: boolean; startIteration?: number },
  ): Promise<void> {
    this.abortController = new AbortController();

    this.dynamicCompressCheckInterval = this.config.compressCheckInterval || 10;

    if (options?.clearTodos !== false) {
      this.todoManager.clear();
    }

    this.onStateChange('thinking');
    this.addStep({
      type: 'thinking',
      content: `Starting task: ${prompt}`,
    });
    this.addStep({
      type: 'todo_list',
      content: '任务规划',
      todos: this.todoManager.listTodos(),
    });

    try {
      const systemMessage = {
        role: 'system',
        content: this.buildSystemPrompt(),
      };

      const userMessage = {
        role: 'user',
        content: prompt,
      };

      let messages: Array<{ role: string; content: string }>;

      if (conversationHistory && conversationHistory.length > 0) {
        messages = await this.compressIfNeeded(
          [
            systemMessage,
            ...conversationHistory.filter(msg => msg.role !== 'tool'),
            userMessage,
          ],
          options?.startIteration || 0
        );
      } else {
        messages = [systemMessage, userMessage];
      }

      logger.debug('Agent starting with conversation history', {
        historyLength: conversationHistory?.length || 0,
        totalMessages: messages.length,
        startIteration: options?.startIteration || 0,
      });

      let iteration = options?.startIteration || 0;
      const maxIterations = this.config.maxIterations || 10;
      const minCompressCheckInterval = this.config.minCompressCheckInterval || 5;

      while (iteration < maxIterations && !this.abortController.signal.aborted) {
        iteration++;

        logger.info(`Agent iteration ${iteration}/${maxIterations}`);

        if (iteration % this.dynamicCompressCheckInterval === 0 && iteration > 0) {
          logger.info('Periodic compression check', {
            iteration,
            checkInterval: this.dynamicCompressCheckInterval,
          });

          const previousLength = messages.length;
          messages = await this.compressIfNeeded(messages, iteration);

          if (messages.length < previousLength) {
            this.dynamicCompressCheckInterval = Math.max(
              Math.floor(this.dynamicCompressCheckInterval * 1.5),
              minCompressCheckInterval
            );

            logger.info('Compress check interval adjusted', {
              previousInterval: this.dynamicCompressCheckInterval / 1.5,
              newInterval: this.dynamicCompressCheckInterval,
            });

            this.addStep({
              type: 'thinking',
              content: `Conversation compressed. Message count: ${messages.length}, Next check in ${this.dynamicCompressCheckInterval} iterations`,
            });
          }
        }

        if (this.onSaveState) {
          await this.onSaveState();
        }

        // 调用 LLM
        const llmResponse = await this.callLLM(messages);

        // 解析响应
        const assistantMessage = llmResponse.choices[0].message;
        messages.push(assistantMessage);

        // 通知回调添加消息（所有 assistant 消息都记录）
        if (this.onMessage) {
          this.onMessage({
            role: 'assistant' as const,
            content: assistantMessage.content || '',
          });
        }

        // 显示思考过程
        if (this.config.showThinking !== false && assistantMessage.content) {
          this.onStateChange('thinking');
          this.addStep({
            type: 'thinking',
            content: assistantMessage.content,
          });
        }

        // 检查是否有工具调用
        if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
          // 执行工具
          const toolResults = await this.executeToolCalls(assistantMessage.tool_calls);

          if (this.onSaveState) {
            await this.onSaveState();
          }

          // 将工具结果添加到消息
          toolResults.forEach(result => {
            messages.push({
              role: 'tool',
              // @ts-ignore - OpenAI API 支持 tool_call_id
              tool_call_id: result.toolCallId,
              content: JSON.stringify(result.result),
            } as any);
          });

          // 检查是否应该继续
          if (!this.shouldContinue(iteration, maxIterations)) {
            break;
          }
        } else {
          const todos = this.todoManager.listTodos();

          if (todos.length > 0 && !this.todoManager.isAllCompleted()) {
            this.addStep({
              type: 'thinking',
              content: '还有未完成的任务，请继续执行直到所有任务完成',
            });
            continue;
          }

          this.onStateChange('idle');
          this.addStep({
            type: 'final_answer',
            content: assistantMessage.content || 'Task completed',
          });
          break;
        }
      }

      if (iteration >= maxIterations) {
        this.onStateChange('idle');

        logger.info('Max iterations reached, compressing final state');
        messages = await this.compressIfNeeded(messages, iteration);

        this.addStep({
          type: 'thinking',
          content: `Reached maximum iterations (${maxIterations}). Compressed message count: ${messages.length}`,
        });

        const todos = this.todoManager.listTodos();
        const incompleteTodos = todos.filter((t) => t.status !== 'completed');

        if (incompleteTodos.length > 0) {
          const incompleteList = incompleteTodos.map((t) => `- [${t.status}] ${t.description}`).join('\n');
          this.addStep({
            type: 'thinking',
            content: `Maximum iterations (${maxIterations}) reached\n\n未完成的任务：\n${incompleteList}`,
          });
        } else {
          this.addStep({
            type: 'thinking',
            content: `Maximum iterations (${maxIterations}) reached`,
          });
        }
      }

    } catch (error) {
      logger.error('Agent execution failed', error);
      this.onStateChange('idle');
      this.addStep({
        type: 'error',
        content: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * 停止 Agent
   */
  stop(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.onStateChange('idle');
      this.addStep({
        type: 'thinking',
        content: 'Agent stopped by user',
      });
    }
  }

  /**
   * 调用 LLM API
   */
  private async callLLM(messages: any[]): Promise<any> {
    const tools = this.toolRegistry.getOpenAISchema();

    try {
      const response = await fetch(this.config.apiBase, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages,
          tools,
          tool_choice: 'auto',
        }),
        signal: this.abortController?.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || `LLM API error: ${response.status}`
        );
      }

      return await response.json();
    } catch (error: any) {
      if (this.isTokenLimitError(error)) {
        logger.warn('Token limit reached, compressing conversation', { error });

        const compressedMessages = await this.compressIfNeeded(messages, 0);

        logger.info('Retrying with compressed messages', {
          originalCount: messages.length,
          compressedCount: compressedMessages.length,
        });

        const response = await fetch(this.config.apiBase, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.config.apiKey}`,
          },
          body: JSON.stringify({
            model: this.config.model,
            messages: compressedMessages,
            tools,
            tool_choice: 'auto',
          }),
          signal: this.abortController?.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error?.message || `LLM API error: ${response.status}`
          );
        }

        return await response.json();
      }

      throw error;
    }
  }

  /**
   * 执行工具调用
   */
  private async executeToolCalls(
    toolCalls: ToolCall[]
  ): Promise<Array<{ toolCallId: string; result: any }>> {
    const toolResults: Array<{ toolCallId: string; result: any }> = [];

    for (const toolCall of toolCalls) {
      const toolName = toolCall.function.name;
      const toolParams = JSON.parse(toolCall.function.arguments);
      const startTime = Date.now();

      this.onStateChange('executing');

      // 添加工具调用步骤
      this.addStep({
        type: 'tool_call',
        content: `Calling tool: ${toolName}`,
        toolName,
        toolParams,
      });

      try {
        // 获取工具并执行
        const tool = this.toolRegistry.get(toolName);
        if (!tool) {
          const errorMsg = `Tool not found: ${toolName}`;
          const duration = Date.now() - startTime;

          this.addStep({
            type: 'tool_result',
            content: `Tool ${toolName} failed`,
            toolName,
            error: errorMsg,
            duration,
          });

          toolResults.push({
            toolCallId: toolCall.id,
            result: { error: errorMsg },
          });

          continue;
        }

        const result = await tool.executor(toolParams);

        // 计算执行时间
        const duration = Date.now() - startTime;

        // 添加工具结果步骤
        this.addStep({
          type: 'tool_result',
          content: `Tool ${toolName} completed`,
          toolName,
          toolResult: result,
          duration,
        });

        if (toolName === 'createTodo' && result) {
          this.addStep({
            type: 'todo_create',
            content: `创建任务: ${result.description}`,
            todos: this.todoManager.listTodos(),
          });
        }

        if (toolName === 'updateTodo' && result) {
          this.addStep({
            type: 'todo_update',
            content: `更新任务状态: ${result.description || result.id}`,
            todos: this.todoManager.listTodos(),
          });
        }

        toolResults.push({
          toolCallId: toolCall.id,
          result,
        });

      } catch (error) {
        const duration = Date.now() - startTime;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';

        logger.error('Tool execution failed', error, { toolName });

        this.addStep({
          type: 'tool_result',
          content: `Tool ${toolName} failed`,
          toolName,
          error: errorMsg,
          duration,
        });

        toolResults.push({
          toolCallId: toolCall.id,
          result: { error: errorMsg },
        });

        continue;
      }
    }

    this.onStateChange('thinking');
    return toolResults;
  }

  /**
   * 判断是否应该继续
   */
  private shouldContinue(iteration: number, maxIterations: number): boolean {
    if (iteration >= maxIterations) {
      return false;
    }

    const todos = this.todoManager.listTodos();
    if (todos.length > 0 && !this.todoManager.isAllCompleted()) {
      return true;
    }

    return true;
  }

  /**
   * 估算 Token 数量
   */
  private estimateTokens(messages: Array<{ role: string; content: string }>): number {
    let totalChars = 0;

    for (const msg of messages) {
      totalChars += msg.content.length;
    }

    return Math.ceil(totalChars / 3);
  }

  /**
   * 检查是否需要压缩并执行压缩
   */
  private async compressIfNeeded(
    messages: Array<{ role: string; content: string }>,
    currentIteration: number
  ): Promise<Array<{ role: string; content: string }>> {
    const contextWindowSize = this.config.contextWindowSize || 128000;
    const compressRatio = this.config.compressRatio || 0.3;
    const compressMinMessages = this.config.compressMinMessages || 20;

    const messagesToConsider = messages.filter(msg =>
      msg.role !== 'tool'
    );

    const estimatedTokens = this.estimateTokens(messagesToConsider);
    const tokenThreshold = contextWindowSize * 0.8;

    const needCompress =
      estimatedTokens >= tokenThreshold ||
      messagesToConsider.length >= compressMinMessages;

    if (!needCompress) {
      return messages;
    }

    logger.info('Compressing conversation', {
      estimatedTokens,
      tokenThreshold,
      messageCount: messagesToConsider.length,
    });

    const keepCount = Math.max(
      Math.floor(messagesToConsider.length * compressRatio),
      1
    );

    const messagesToKeep = messagesToConsider.slice(-keepCount);
    const messagesToCompress = messagesToConsider.slice(
      0,
      messagesToConsider.length - keepCount
    );

    if (messagesToCompress.length === 0) {
      return messages;
    }

    try {
      const summary = await this.generateSummary(messagesToCompress);

      const toolMessages = messages.filter(msg => msg.role === 'tool');

      return [
        {
          role: 'system',
          content: `[Summary of previous conversation]: ${summary}`
        },
        ...messagesToKeep,
        ...toolMessages,
      ];
    } catch (error) {
      logger.error('Failed to compress conversation', error);
      return messages;
    }
  }

  /**
   * 生成对话摘要
   */
  private async generateSummary(
    messages: Array<{ role: string; content: string }>
  ): Promise<string> {
    const conversationText = messages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n\n');

    const summaryPrompt = `请用中文简洁总结以下对话内容，2-3 句话即可：\n\n${conversationText}`;

    const response = await fetch(this.config.apiBase, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          { role: 'system', content: summaryPrompt },
          { role: 'user', content: conversationText },
        ],
      }),
      signal: this.abortController?.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  /**
   * 判断是否为 Token 限制错误
   */
  private isTokenLimitError(error: any): boolean {
    const defaultErrorCodes = [
      'context_length_exceeded',
      'max_tokens_exceeded',
      'token_limit',
      'token_limit_exceeded',
      'maximum context length exceeded',
      'maximum tokens exceeded',
    ];

    const tokenLimitErrorCodes = this.config.tokenLimitErrorCodes || defaultErrorCodes;
    const errorMessage = error?.message?.toLowerCase() || '';

    return tokenLimitErrorCodes.some(code =>
      errorMessage.includes(code.toLowerCase())
    );
  }

  /**
   * 构建 System Prompt
   */
  private buildSystemPrompt(): string {
    const currentTime = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    const tools = this.toolRegistry.getAll();
    const toolDescriptions = tools
      .map(t => `  - ${t.name}: ${t.description}`)
      .join('\n');

    return `
当前时间：${currentTime}

你是一名智能助手，帮助用户在 ONote 笔记应用中高效完成各种任务。

## 可用工具

${toolDescriptions}

## 工作原则

1. **优先使用当前文件**：用户请求中的"文件"、"这个文件"等指代当前打开的文件（Current File），优先使用 Current File 的 URI
2. **默认目录**：Working Directory 是当前文件所在的目录（非根目录），listFiles 默认查询 Working Directory
3. **目标导向**：始终以完成任务为目标，合理规划工具使用顺序
4. **安全第一**：谨慎使用 writeFile、deleteFile 等危险操作，必要时确认
5. **高效执行**：避免重复调用相同工具，充分利用工具返回结果
6. **清晰解释**：在使用工具前说明意图，使用后解释结果

## 任务流程

1. **分析需求**：理解用户想要完成什么任务
2. **识别上下文**：
   - 如果提到"文件"、"这个文件"等，使用 Current File
   - 如果需要查看目录，使用 Working Directory（listFiles 默认路径）
3. **选择工具**：根据任务需求选择合适的工具
4. **执行操作**：按逻辑顺序执行工具调用
5. **总结结果**：向用户说明任务完成情况和关键发现

## 任务规划

**重要：** 对于复杂任务，请先创建 Todo 列表规划任务步骤：

1. 使用 \`createTodo\` 创建任务清单，分解为可执行的子任务
2. 执行每个任务前，使用 \`updateTodo(id, "in_progress")\` 标记为进行中
3. 任务完成后，使用 \`updateTodo(id, "completed")\` 标记为已完成
4. 使用 \`listTodos\` 随时查看任务进度

**示例流程：**
\`\`\`json
// 1. 创建任务列表
{ "name": "createTodo", "arguments": "{\\"description\\": \\"读取文件\\", \\"priority\\": \\"high\\"}" }
{ "name": "createTodo", "arguments": "{\\"description\\": \\"修改内容\\", \\"priority\\": \\"medium\\"}" }
{ "name": "createTodo", "arguments": "{\\"description\\": \\"保存文件\\", \\"priority\\": \\"medium\\"}" }

// 2. 执行时更新状态
{ "name": "updateTodo", "arguments": "{\\"id\\": \\"todo-xxx\\", \\"status\\": \\"in_progress\\"}" }

// 3. 任务完成后
{ "name": "updateTodo", "arguments": "{\\"id\\": \\"todo-xxx\\", \\"status\\": \\"completed\\"}" }
\`\`\`

**注意：** 
- 如果创建了任务列表，必须完成所有任务才能结束
- 简单任务可以不创建 Todo 列表，直接执行
- 优先级：high > medium > low

## 工具使用示例

当需要调用工具时，使用以下格式：

\`\`\`json
{
  "tool_calls": [
    {
      "id": "call_unique_id",
      "type": "function",
      "function": {
        "name": "readFile",
        "arguments": "{\\"uri\\": \\"file:///path/to/file.md\\"}"
      }
    }
  ]
}
\`\`\`

## 重要提示

- **当前文件优先**：用户未明确指定文件路径时，所有文件操作默认使用 Current File
- **目录查询优先**：用户请求列出文件时，默认使用 Working Directory
- **文件 URI 格式**：必须是完整路径，例如 \`file:///Users/username/notes/file.md\`
- **参数 JSON 格式**：arguments 字段必须是 JSON 字符串，确保转义正确
- **工具错误处理**：如果工具调用失败，分析错误原因并采取以下措施：
  - **临时错误**（如网络超时）：可以重试相同工具
  - **参数错误**：检查并修正参数后重试
  - **文件不存在**：先使用 listFiles 确认文件是否存在
  - **权限错误**：向用户说明需要手动解决该问题
  - **其他错误**：向用户说明遇到的问题，提供替代方案
- **错误恢复**：工具失败后不要放弃任务，尝试：
  - 使用其他工具完成任务
  - 修改参数后重试
  - 或向用户说明无法完成的原因
- **任务完成**：
  - 如果创建了任务列表，必须完成所有任务（状态为 completed）才能结束
  - 如果没有创建任务列表，可以直接给出最终答案
- **迭代限制**：最多迭代 50 次，如果未完成任务，给出中间结果和建议
  `.trim();
  }

  /**
   * 添加执行步骤
   */
  private addStep(step: Omit<ExecutionStep, 'id' | 'timestamp'>): void {
    this.onStep({
      id: uuid('step-'),
      timestamp: new Date(),
      ...step,
    });
  }
}
