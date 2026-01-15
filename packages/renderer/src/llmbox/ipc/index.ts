import { createChannel } from 'bidc';
import type { LLMBoxMessageType } from '../utils/constants';
import { generateRequestId, withTracking } from './tracker';
import type { SendOptions, MessageData, MessageResponse } from './types';
import { TimeoutError } from './errors';
import { getLogger } from '/@/shared/logger';

const logger = getLogger('IPC');

export interface Channel {
  send: (message: {
    type: LLMBoxMessageType;
    data: unknown;
  }) => Promise<Record<string, unknown>>;
}

export const channel = createChannel('MAIN_FRAME-LLM_BOX');

// ============================================================================
// 带超时和追踪的发送函数
// ============================================================================

/**
 * 带超时的发送函数
 */
export async function sendWithTimeout<T>(
  message: { type: LLMBoxMessageType; data: unknown },
  options: SendOptions = {},
): Promise<T> {
  const { timeout = 30000, requestId = generateRequestId() } = options;

  return withTracking(message.type, requestId, async () => {
    try {
      const response = await Promise.race([
        channel.send(message),
        timeoutAfter(timeout),
      ]);

      logger.debug('Response received', { requestId, type: message.type });
      return response as T;
    } catch (error) {
      if (error instanceof Error && error.message === 'Timeout') {
        throw new TimeoutError(requestId, timeout);
      }
      throw error;
    }
  });
}

/**
 * 超时 Promise
 */
function timeoutAfter(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Timeout')), ms);
  });
}

// ============================================================================
// 向后兼容的导出
// ============================================================================

/**
 * 包装原始 channel，添加默认超时
 */
export const channelWithDefaults = {
  send: (message: {
    type: LLMBoxMessageType;
    data: unknown;
  }) => sendWithTimeout(message, { timeout: 30000 }),

  // 新接口（推荐使用）
  sendWithOptions: <T>(
    message: { type: LLMBoxMessageType; data: unknown },
    options?: SendOptions,
  ) => sendWithTimeout<T>(message, options),
};

// ============================================================================
// 类型安全的发送函数
// ============================================================================

/**
 * 类型安全的发送函数
 * @param type 消息类型
 * @param data 消息数据（类型安全）
 * @param options 发送选项（超时、重试等）
 * @returns Promise<MessageResponse<T>>
 *
 * @example
 * ```typescript
 * // 类型安全的发送
 * const response = await typedSend('AGENT_FILE_READ', {
 *   uri: 'file:///path/to/file.md',
 * });
 *
 * // IDE 会自动推断 response 的类型为：
 * // { content: string } | { error: string }
 * ```
 */
export function typedSend<T extends LLMBoxMessageType>(
  type: T,
  data: MessageData<T>,
  options?: SendOptions,
): Promise<MessageResponse<T>> {
  return sendWithTimeout<MessageResponse<T>>(
    { type, data },
    options,
  );
}

// 导出类型供外部使用
export type { MessageData, MessageResponse, SendOptions } from './types';

