import OpenAI from 'openai';
import type { Message, Tool, ToolMessage, AssistantMessage } from '../../types';
import _ from 'lodash';

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
  private client?: OpenAI;

  private convertMessages(
    messages: Message[],
  ): OpenAI.Chat.ChatCompletionMessageParam[] {
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

  private convertTools(
    tools?: Tool | Tool[],
  ): OpenAI.Chat.ChatCompletionTool[] | undefined {
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

  getConfig() {
    const settings =
      (window as any).__settings || ({} as Record<string, string>);

    const apiKey = settings['chatgpt.api-key'];
    const apiBase = settings['chatgpt.base-url'];
    const model = settings['chatgpt.model-name'];
    return {
      apiBase,
      apiKey,
      model,
    };
  }

  getOrCreateClient(config: ReturnType<typeof this.getConfig>) {
    const prevConfig = {
      apiBase: this.client?.baseURL,
      apiKey: this.client?.apiKey,
    };
    if (
      !this.client ||
      !_.isEqual(prevConfig, {
        apiBase: config.apiBase,
        apiKey: config.apiKey,
      })
    ) {
      this.client = new OpenAI({
        baseURL: config.apiBase,
        apiKey: config.apiKey,
        dangerouslyAllowBrowser: true,
      });
    }
    return this.client!;
  }

  async *stream(
    messages: Message[],
    options?: { signal?: AbortSignal; tools?: Tool | Tool[] },
  ): AsyncGenerator<{
    content: string;
    toolCalls: { index: number; id: string; name: string; arguments: string }[];
  }> {
    const config = this.getConfig();
    const client = this.getOrCreateClient(config);
    const stream = await client.chat.completions.create({
      model: config.model,
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
          index: tc.index,
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
    const toolCallsMap = new Map<number, ToolCallResult>();

    for await (const chunk of this.stream(messages, options)) {
      // Handle content
      if (chunk.content) {
        content += chunk.content;
        callbacks?.onChunk?.(chunk.content, isFirstChunk);
        isFirstChunk = false;
      }

      // Handle tool calls
      for (const tc of chunk.toolCalls) {
        if (!toolCallsMap.has(tc.index)) {
          toolCallsMap.set(tc.index, {
            id: tc.id || '',
            name: tc.name || '',
            arguments: tc.arguments || '',
            content: '',
          });
        } else {
          const existing = toolCallsMap.get(tc.index)!;
          if (tc.name && !existing.name) {
            existing.name = tc.name;
          }
          if (tc.arguments) {
            existing.arguments += tc.arguments;
          }
          if (tc.id && !existing.id) {
            existing.id = tc.id;
          }
        }
      }
    }

    const toolCalls = Array.from(toolCallsMap.values()).filter((tc) => tc.name);

    callbacks?.onComplete?.(content, toolCalls);

    return { content, toolCalls };
  }
}
