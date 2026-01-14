import type { Message, Tool } from '../types';
import { parseStream, type StreamingChunk } from './sse';

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
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    let apiBase = config.apiBase?.trim() || '';
    if (!apiBase) {
      apiBase = 'https://api.openai.com/v1';
    }
    if (!apiBase.startsWith('http://') && !apiBase.startsWith('https://')) {
      apiBase = 'https://' + apiBase;
    }
    if (!apiBase.endsWith('/chat/completions')) {
      apiBase = apiBase.replace(/\/$/, '') + '/chat/completions';
    }
    this.config = {
      ...config,
      apiBase,
    };
  }

  private buildHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.config.apiKey}`,
    };
  }

  private buildBody(
    messages: Message[],
    tools?: Tool[]
  ): Record<string, unknown> {
    return {
      model: this.config.model,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
        tool_calls: m.tool_calls,
      })),
      tools: tools?.map((t) => this.toolToSchema(t)),
      tool_choice: 'auto',
      stream: true,
    };
  }

  private toolToSchema(tool: Tool): Record<string, unknown> {
    return {
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    };
  }

  async *stream(
    messages: Message[],
    options?: { signal?: AbortSignal; tools?: Tool | Tool[] }
  ): AsyncGenerator<StreamingChunk> {
    const tools = options?.tools
      ? (Array.isArray(options.tools) ? options.tools : [options.tools])
      : undefined;
    const body = this.buildBody(messages, tools);

    const response = await fetch(this.config.apiBase, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(body),
      signal: options?.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new LLMApiError(response.status, errorText);
    }

    const stream = response.body;
    if (!stream) {
      throw new Error('No response body stream');
    }

    yield* parseStream(stream, options?.signal);
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
