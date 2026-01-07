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
          throw new Error(`Tool not found: ${toolName}`);
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
        logger.error('Tool execution failed', error, { toolName });

        this.addStep({
          type: 'tool_result',
          content: `Tool ${toolName} failed`,
          toolName,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        throw error;
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
You are an intelligent AI assistant with access to tools that help users with their tasks in ONote.

## Available Tools

${toolDescriptions}

## Instructions

1. When you need to use a tool, include a tool_calls array in your response.
2. After using a tool, analyze the results and decide whether to:
   - Use another tool to gather more information
   - Complete the task and provide a final answer
3. Always explain your reasoning before using tools.
4. Be concise and focused on the user's request.
5. Use tools efficiently - don't repeat the same tool call unnecessarily.

## Tool Usage Format

When you need to call a tool, format your response as:

\`\`\`json
{
  "content": "I'll help you with that. Let me read the file...",
  "tool_calls": [
    {
      "id": "call_${Date.now()}",
      "type": "function",
      "function": {
        "name": "tool-name",
        "arguments": "{\\"uri\\": \\"file:///path/to/file.md\\"}"
      }
    }
  ]
}
\`\`\`

## Important Notes

- Some tools may be dangerous (like writeFile or deleteFile) - use them carefully
- Always provide context about what you're doing and why
- File URIs should be in the format: file:///absolute/path/to/file
- If you encounter an error, explain it clearly and suggest alternatives
- Keep your responses concise and actionable
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
