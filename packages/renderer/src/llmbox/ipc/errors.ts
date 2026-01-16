// ============================================================================
// IPC 错误类型定义
// ============================================================================

/**
 * IPC 错误基类
 */
export class IPCError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: unknown,
    public requestId?: string,
  ) {
    super(message);
    this.name = 'IPCError';
    Error.captureStackTrace?.(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details,
      requestId: this.requestId,
    };
  }

  toString(): string {
    return `[${this.code}] ${this.message}${
      this.requestId ? ` (requestId: ${this.requestId})` : ''
    }`;
  }
}

/**
 * 超时错误
 */
export class TimeoutError extends IPCError {
  constructor(requestId: string, timeout: number) {
    super(
      'TIMEOUT',
      `Request timeout after ${timeout}ms`,
      { timeout },
      requestId,
    );
    this.name = 'TimeoutError';
  }
}

/**
 * Handler 未找到错误
 */
export class HandlerNotFoundError extends IPCError {
  constructor(messageType: string) {
    super(
      'HANDLER_NOT_FOUND',
      `No handler registered for message type: ${messageType}`,
      { messageType },
    );
    this.name = 'HandlerNotFoundError';
  }
}

/**
 * 消息验证错误
 */
export class MessageValidationError extends IPCError {
  constructor(
    messageType: string,
    field: string,
    expected: string,
    received: unknown,
  ) {
    super(
      'VALIDATION_ERROR',
      `Message validation failed for ${messageType}.${field}`,
      { field, expected, received },
      undefined,
    );
    this.name = 'MessageValidationError';
  }
}

/**
 * Handler 执行错误
 */
export class HandlerExecutionError extends IPCError {
  constructor(
    messageType: string,
    requestId: string,
    originalError: Error,
  ) {
    super(
      'HANDLER_ERROR',
      `Handler execution failed for ${messageType}: ${originalError.message}`,
      {
        originalError: originalError.message,
        stack: originalError.stack,
      },
      requestId,
    );
    this.name = 'HandlerExecutionError';
  }
}

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 检查错误是否为 IPCError
 */
export function isIPCError(error: unknown): error is IPCError {
  return error instanceof IPCError;
}

/**
 * 获取错误代码
 */
export function getErrorCode(error: unknown): string {
  if (isIPCError(error)) {
    return error.code;
  }
  return 'UNKNOWN_ERROR';
}

/**
 * 获取错误信息（安全地）
 */
export function getErrorMessage(error: unknown): string {
  if (isIPCError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

/**
 * 将错误转换为可序列化的对象
 */
export function serializeError(error: unknown): Record<string, unknown> {
  if (isIPCError(error)) {
    return error.toJSON();
  }
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
  return {
    error: String(error),
  };
}
