import type { ToolCall, AgentConfig, ExecutionStep } from './types';
import ToolRegistry from './ToolRegistry';
import { getLogger } from '../../shared/logger';
import { uuid } from '../../common/tunnel/utils';

const logger = getLogger('AgentOrchestrator');

interface AgentOrchestratorOptions {
  config: AgentConfig;
  toolRegistry: ToolRegistry;
  onStep: (step: ExecutionStep) => void;
  onStateChange: (state: 'idle' | 'thinking' | 'executing') => void;
  onMessage?: (message: { role: 'assistant' | 'user' | 'system' | 'tool'; content: string }) => void;
}

export class AgentOrchestrator {
  private config: AgentConfig;
  private toolRegistry: ToolRegistry;
  private abortController: AbortController | null = null;
  private onStep: (step: ExecutionStep) => void;
  private onStateChange: (state: 'idle' | 'thinking' | 'executing') => void;
  private onMessage?: (message: { role: 'assistant' | 'user' | 'system' | 'tool'; content: string }) => void;

  constructor(options: AgentOrchestratorOptions) {
    this.config = options.config;
    this.toolRegistry = options.toolRegistry;
    this.onStep = options.onStep;
    this.onStateChange = options.onStateChange;
    this.onMessage = options.onMessage;
  }

  /**
   * 运行 Agent
   * @param prompt - 当前任务提示
   * @param conversationHistory - 对话历史（可选）
   */
  async run(prompt: string, conversationHistory?: Array<{ role: string; content: string }>): Promise<void> {
    this.abortController = new AbortController();

    this.addStep({
      type: 'thinking',
      content: `Starting task: ${prompt}`,
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
        messages = [
          systemMessage,
          ...conversationHistory.filter(msg => msg.role !== 'tool'),
          userMessage,
        ];
      } else {
        messages = [
          systemMessage,
          userMessage,
        ];
      }

      logger.debug('Agent starting with conversation history', {
        historyLength: conversationHistory?.length || 0,
        totalMessages: messages.length,
      });

      let iteration = 0;
      const maxIterations = this.config.maxIterations || 10;

      while (iteration < maxIterations && !this.abortController.signal.aborted) {
        iteration++;

        logger.info(`Agent iteration ${iteration}/${maxIterations}`);

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
          this.addStep({
            type: 'thinking',
            content: assistantMessage.content,
          });
        }

        // 检查是否有工具调用
        if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
          // 执行工具
          const toolResults = await this.executeToolCalls(assistantMessage.tool_calls);

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
          // 没有工具调用，任务完成
          this.addStep({
            type: 'final_answer',
            content: assistantMessage.content || 'Task completed',
          });
          break;
        }
      }

      if (iteration >= maxIterations) {
        this.addStep({
          type: 'thinking',
          content: `Maximum iterations (${maxIterations}) reached`,
        });
      }

    } catch (error) {
      logger.error('Agent execution failed', error);
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
    return true;
  }

  /**
   * 构建 System Prompt
   */
  private buildSystemPrompt(): string {
    const tools = this.toolRegistry.getAll();
    const toolDescriptions = tools
      .map(t => `  - ${t.name}: ${t.description}`)
      .join('\n');

    return `
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
- **任务完成**：如果没有工具需要调用，直接给出最终答案
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
