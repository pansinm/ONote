export interface StreamingChunk {
  content: string | null;
  toolCalls: Array<{
    id: string;
    name: string;
    arguments: string;
  }>;
  isDone: boolean;
}

export function parseSSE(line: string): StreamingChunk | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed === 'data: [DONE]') return null;
  if (!trimmed.startsWith('data: ')) return null;

  const dataStr = trimmed.slice(6);
  try {
    const data = JSON.parse(dataStr, (_, v) =>
      typeof v === 'string' ? v.trim() : v
    );
    const delta = data.choices?.[0]?.delta;
    const finishReason = data.choices?.[0]?.finish_reason;

    const toolCalls: StreamingChunk['toolCalls'] = [];

    if (delta?.tool_calls) {
      for (const tc of delta.tool_calls) {
        const functionObj = tc.function || {};
        toolCalls.push({
          id: tc.id || '',
          name: functionObj.name || '',
          arguments: functionObj.arguments || '',
        });
      }
    }

    return {
      content: delta?.content ?? null,
      toolCalls,
      isDone: finishReason === 'tool_calls' || finishReason === 'stop',
    };
  } catch {
    return null;
  }
}

export async function* streamToLines(
  stream: ReadableStream<Uint8Array>,
  signal?: AbortSignal
): AsyncGenerator<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  const MAX_BUFFER_SIZE = 1024 * 1024;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (signal?.aborted) {
        break;
      }

      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      if (buffer.length > MAX_BUFFER_SIZE) {
        throw new Error('SSE buffer overflow');
      }

      let newlineIdx: number;
      while ((newlineIdx = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, newlineIdx);
        buffer = buffer.slice(newlineIdx + 1);
        yield line;
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export async function* parseStream(
  stream: ReadableStream<Uint8Array>,
  signal?: AbortSignal
): AsyncGenerator<StreamingChunk> {
  for await (const line of streamToLines(stream, signal)) {
    const chunk = parseSSE(line);
    if (chunk) yield chunk;
  }
}
