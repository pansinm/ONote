import { getLogger } from '/@/shared/logger';
import type { LLMBoxMessageType } from '../utils/constants';

const logger = getLogger('IPCTracker');

// ============================================================================
// 请求追踪器
// ============================================================================

export class IPCTracker {
  private context = new Map<string, RequestContext>();

  /**
   * 开始追踪请求
   */
  start(type: LLMBoxMessageType, requestId: string): void {
    this.context.set(requestId, {
      requestId,
      type,
      startTime: Date.now(),
    });

    logger.debug('Request started', { requestId, type });
  }

  /**
   * 完成请求追踪
   */
  complete(requestId: string, success: boolean, error?: string): void {
    const ctx = this.context.get(requestId);
    if (!ctx) {
      logger.warn('Request context not found', { requestId });
      return;
    }

    const duration = Date.now() - ctx.startTime;

    logger.debug('Request completed', {
      requestId,
      type: ctx.type,
      duration,
      success,
      error,
    });

    this.context.delete(requestId);
  }

  /**
   * 获取请求上下文
   */
  getContext(requestId: string): RequestContext | undefined {
    return this.context.get(requestId);
  }

  /**
   * 获取所有进行中的请求
   */
  getPendingRequests(): RequestContext[] {
    return Array.from(this.context.values());
  }
}

interface RequestContext {
  requestId: string;
  type: LLMBoxMessageType;
  startTime: number;
}

export const ipcTracker = new IPCTracker();

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 生成请求 ID
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * 包装 Promise 以追踪请求
 */
export async function withTracking<T>(
  type: LLMBoxMessageType,
  requestId: string,
  fn: () => Promise<T>,
): Promise<T> {
  ipcTracker.start(type, requestId);

  try {
    const result = await fn();
    ipcTracker.complete(requestId, true);
    return result;
  } catch (error) {
    ipcTracker.complete(requestId, false, String(error));
    throw error;
  }
}
