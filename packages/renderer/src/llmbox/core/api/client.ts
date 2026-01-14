import OpenAI from 'openai';
import type { Message, Tool } from '../types';

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
    let baseURL = config.apiBase?.trim() || '';
    if (!baseURL) {
      baseURL = 'https://api.openai.com/v1';
    }
    if (!baseURL.startsWith('http://') && !baseURL.startsWith('https://')) {
      baseURL = 'https://' + baseURL;
    }
    if (baseURL.endsWith('/chat/completions')) {
      baseURL = baseURL.replace(/\/chat\/completions$/, '');
    }
    if (baseURL.endsWith('/')) {
      baseURL = baseURL.slice(0, -1);
    }

    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL,
      dangerouslyAllowBrowser: true,
    });
    this.model = config.model;
  }

  async *stream(
    messages: Message[],
    options?: { signal?: AbortSignal; tools?: Tool | Tool[] }
  ): AsyncGenerator<{
    content: string;
    toolCalls: { id: string; name: string; arguments: string }[];
  }> {
    const tools = options?.tools
      ? (Array.isArray(options.tools) ? options.tools : [options.tools])
      : undefined;

    const stream = await this.client.chat.completions.create({
      model: this.model,
      messages: messages.map((m) => ({
        role: m.role as 'user' | 'assistant' | 'system' | 'tool',
        content: m.content,
        tool_calls: m.tool_calls as
          | Array<{
              id: string;
              type: 'function';
              function: { name: string; arguments: string };
            }>
          | undefined,
      })),
      tools: tools?.map((t) => ({
        type: 'function' as const,
        function: {
          name: t.name,
          description: t.description,
          parameters: t.parameters as Record<string, unknown>,
        },
      })),
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
          id: tc.id,
          name: tc.function?.name || '',
          arguments: tc.function?.arguments || '',
        })),
      };
    }
  }

  async complete(
    messages: Message[],
    options?: { signal?: AbortSignal; tools?: Tool[] }
  ): Promise<{ content: string; toolCalls: ToolCallResult[] }> {
    let content = '';
    const toolCalls: Map<string, ToolCallResult> = new Map();

    for await (const chunk of this.stream(messages, options)) {
      if (chunk.content) {
        content += chunk.content;
      }

      for (const tc of chunk.toolCalls) {
        if (!toolCalls.has(tc.id)) {
          toolCalls.set(tc.id, {
            id: tc.id,
            name: tc.name,
            arguments: '',
            content: '',
          });
        }
        const existing = toolCalls.get(tc.id)!;
        existing.arguments += tc.arguments;
      }
    }

    return {
      content,
      toolCalls: Array.from(toolCalls.values()),
    };
  }

  async completeWithStreaming(
    messages: Message[],
    options?: { signal?: AbortSignal; tools?: Tool[] },
    callbacks?: StreamingCallbacks
  ): Promise<{ content: string; toolCalls: ToolCallResult[] }> {
    let content = '';
    let isFirstChunk = true;
    const toolCalls: Map<string, ToolCallResult> = new Map();

    for await (const chunk of this.stream(messages, options)) {
      if (chunk.content) {
        content += chunk.content;
        if (callbacks?.onChunk) {
          callbacks.onChunk(chunk.content, isFirstChunk);
          isFirstChunk = false;
        }
      }

      for (const tc of chunk.toolCalls) {
        if (!toolCalls.has(tc.id)) {
          toolCalls.set(tc.id, {
            id: tc.id,
            name: tc.name,
            arguments: '',
            content: '',
          });
        }
        const existing = toolCalls.get(tc.id)!;
        existing.arguments += tc.arguments;
      }
    }

    const result = {
      content,
      toolCalls: Array.from(toolCalls.values()),
    };

    if (callbacks?.onComplete) {
      callbacks.onComplete(result.content, result.toolCalls);
    }

    return result;
  }
}

export class LLMApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: string
  ) {
    super(`LLM API error: ${status} - ${body.slice(0, 100)}`);
    this.name = 'LLMApiError';
  }
}

export function isLLMApiError(error: unknown): error is LLMApiError {
  return error instanceof LLMApiError;
}
