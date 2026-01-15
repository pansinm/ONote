import OpenAI from 'openai';
import type { Message, Tool, ToolMessage, AssistantMessage } from '../../types';

export interface LLMConfig {
  apiKey: string;
  model: string;
  apiBase: string;
}

export interface LLMClientOptions {
  config: LLMConfig;
  signal?: AbortSignal;
}

export interface ToolCallResult {
  id: string;
  name: string;
  arguments: string;
  content: string;
}

export interface StreamingCallbacks {
  onChunk?: (content: string, isFirst: boolean) => void;
  onToolCalls?: (toolCalls: ToolCallResult[]) => void;
  onComplete?: (content: string, toolCalls: ToolCallResult[]) => void;
}

export class LLMClient {
  private client: OpenAI;
  private model: string;

  constructor(config: LLMConfig) {
    const baseURL = this.normalizeBaseURL(config.apiBase);
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL,
      dangerouslyAllowBrowser: true,
    });
    this.model = config.model;
  }

  private normalizeBaseURL(baseURL: string): string {
    if (!baseURL?.trim()) {
      return 'https://api.openai.com/v1';
    }

    // Remove trailing chat/completions
    let normalized = baseURL.replace(/\/chat\/completions$/, '');

    // Ensure protocol
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = 'https://' + normalized;
    }

    // Remove trailing slash
    return normalized.replace(/\/$/, '');
  }

  private convertMessages(messages: Message[]): OpenAI.Chat.ChatCompletionMessageParam[] {
    return messages.map((m) => {
      if (m.role === 'tool') {
        const tm = m as ToolMessage;
        return {
          role: 'tool' as const,
          content: tm.content,
          tool_call_id: tm.toolCallId,
        };
      }
      const am = m as AssistantMessage;
      return {
        role: am.role as 'user' | 'assistant' | 'system',
        content: am.content,
        tool_calls: am.toolCalls?.map((tc) => ({
          id: tc.id,
          type: 'function' as const,
          function: {
            name: tc.name,
            arguments: JSON.stringify(tc.arguments),
          },
        })),
      };
    });
  }

  private convertTools(tools?: Tool | Tool[]): OpenAI.Chat.ChatCompletionTool[] | undefined {
    if (!tools) return undefined;
    const toolsArray = Array.isArray(tools) ? tools : [tools];
    return toolsArray.map((t) => ({
      type: 'function' as const,
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters as Record<string, unknown>,
      },
    }));
  }

  async *stream(
    messages: Message[],
    options?: { signal?: AbortSignal; tools?: Tool | Tool[] },
  ): AsyncGenerator<{
    content: string;
    toolCalls: { id: string; name: string; arguments: string }[];
  }> {
    const stream = await this.client.chat.completions.create({
      model: this.model,
      messages: this.convertMessages(messages),
      tools: this.convertTools(options?.tools),
      tool_choice: 'auto',
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;
      const content = delta?.content || '';
      const toolCalls = delta?.tool_calls || [];

      yield {
        content,
        toolCalls: toolCalls.map((tc) => ({
          id: tc.id || '',
          name: tc.function?.name || '',
          arguments: tc.function?.arguments || '',
        })),
      };
    }
  }

  async complete(
    messages: Message[],
    options?: { signal?: AbortSignal; tools?: Tool | Tool[] },
    callbacks?: StreamingCallbacks,
  ): Promise<{ content: string; toolCalls: ToolCallResult[] }> {
    let content = '';
    let isFirstChunk = true;
    const toolCallsMap = new Map<string, ToolCallResult>();

    for await (const chunk of this.stream(messages, options)) {
      // Handle content
      if (chunk.content) {
        content += chunk.content;
        callbacks?.onChunk?.(chunk.content, isFirstChunk);
        isFirstChunk = false;
      }

      // Handle tool calls
      for (const tc of chunk.toolCalls) {
        if (!toolCallsMap.has(tc.id)) {
          toolCallsMap.set(tc.id, {
            id: tc.id,
            name: tc.name || '',
            arguments: tc.arguments || '',
            content: '',
          });
        } else {
          const existing = toolCallsMap.get(tc.id)!;
          if (tc.name && !existing.name) {
            existing.name = tc.name;
          }
          if (tc.arguments) {
            existing.arguments += tc.arguments;
          }
        }
      }
    }

    const toolCalls = Array.from(toolCallsMap.values()).filter((tc) => tc.name);

    callbacks?.onComplete?.(content, toolCalls);

    return { content, toolCalls };
  }
}
