/**
 * ONote 统一错误类型定义
 *
 * 提供标准化的错误类和错误码，便于错误处理和用户提示
 */

/**
 * 错误码枚举
 */
export enum ErrorCode {
  // 通用错误 (1xxx)
  UNKNOWN = 1000,
  NETWORK_ERROR = 1001,
  TIMEOUT = 1002,
  INVALID_PARAMS = 1003,
  OPERATION_FAILED = 1004,

  // 文件操作错误 (2xxx)
  FILE_NOT_FOUND = 2001,
  FILE_READ_FAILED = 2002,
  FILE_WRITE_FAILED = 2003,
  FILE_DELETE_FAILED = 2004,
  FILE_ALREADY_EXISTS = 2005,
  INVALID_FILE_TYPE = 2006,

  // 数据源错误 (3xxx)
  DATASOURCE_NOT_FOUND = 3001,
  DATASOURCE_CONNECTION_FAILED = 3002,
  DATASOURCE_AUTH_FAILED = 3003,
  DATASOURCE_SYNC_FAILED = 3004,

  // 插件错误 (4xxx)
  PLUGIN_NOT_FOUND = 4001,
  PLUGIN_LOAD_FAILED = 4002,
  PLUGIN_INVALID = 4003,
  PLUGIN_VERSION_INCOMPATIBLE = 4004,

  // 编辑器错误 (5xxx)
  EDITOR_OPERATION_FAILED = 5001,
  EDITOR_CONTENT_TOO_LARGE = 5002,
  EDITOR_SAVE_FAILED = 5003,

  // LLM 错误 (6xxx)
  LLM_API_ERROR = 6001,
  LLM_AUTH_FAILED = 6002,
  LLM_QUOTA_EXCEEDED = 6003,
  LLM_TIMEOUT = 6004,

  // 配置错误 (7xxx)
  CONFIG_INVALID = 7001,
  CONFIG_MISSING = 7002,
}

/**
 * 错误严重级别
 */
export enum ErrorSeverity {
  /** 低 - 不影响核心功能 */
  LOW = 'low',
  /** 中 - 影响部分功能 */
  MEDIUM = 'medium',
  /** 高 - 影响核心功能 */
  HIGH = 'high',
  /** 严重 - 应用无法使用 */
  CRITICAL = 'critical',
}

/**
 * 基础应用错误类
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly severity: ErrorSeverity;
  public readonly context?: Record<string, unknown>;
  public readonly originalError?: Error;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: Record<string, unknown>,
    originalError?: Error,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.severity = severity;
    this.context = context;
    this.originalError = originalError;

    // 保持正确的堆栈跟踪
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * 转换为可序列化的对象
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      severity: this.severity,
      context: this.context,
      stack: this.stack,
    };
  }

  /**
   * 用户友好的错误消息
   */
  getUserMessage(): string {
    return this.message;
  }

  /**
   * 是否应该向用户显示
   */
  shouldShowToUser(): boolean {
    return this.severity >= ErrorSeverity.MEDIUM;
  }
}

/**
 * 文件操作错误
 */
export class FileError extends AppError {
  constructor(
    message: string,
    code: ErrorCode,
    filePath?: string,
    originalError?: Error,
  ) {
    super(message, code, ErrorSeverity.MEDIUM, { filePath }, originalError);
    this.name = 'FileError';
  }

  getUserMessage(): string {
    if (this.context?.filePath) {
      return `${this.message}: ${this.context.filePath as string}`;
    }
    return this.message;
  }
}

/**
 * 数据源错误
 */
export class DataSourceError extends AppError {
  constructor(
    message: string,
    code: ErrorCode,
    dataSourceType?: string,
    originalError?: Error,
  ) {
    super(message, code, ErrorSeverity.HIGH, { dataSourceType }, originalError);
    this.name = 'DataSourceError';
  }
}

/**
 * 插件错误
 */
export class PluginError extends AppError {
  constructor(
    message: string,
    code: ErrorCode,
    pluginName?: string,
    originalError?: Error,
  ) {
    super(message, code, ErrorSeverity.MEDIUM, { pluginName }, originalError);
    this.name = 'PluginError';
  }

  getUserMessage(): string {
    if (this.context?.pluginName) {
      return `插件 "${this.context.pluginName as string}" 错误: ${this.message}`;
    }
    return this.message;
  }
}

/**
 * 网络错误
 */
export class NetworkError extends AppError {
  constructor(
    message: string,
    url?: string,
    originalError?: Error,
  ) {
    super(
      message,
      ErrorCode.NETWORK_ERROR,
      ErrorSeverity.MEDIUM,
      { url },
      originalError,
    );
    this.name = 'NetworkError';
  }
}

/**
 * LLM API 错误
 */
export class LLMError extends AppError {
  constructor(
    message: string,
    code: ErrorCode,
    provider?: string,
    originalError?: Error,
  ) {
    super(message, code, ErrorSeverity.MEDIUM, { provider }, originalError);
    this.name = 'LLMError';
  }

  getUserMessage(): string {
    const provider = this.context?.provider ? ` (${this.context.provider as string})` : '';
    return `AI 助手${provider}错误: ${this.message}`;
  }
}

/**
 * 配置错误
 */
export class ConfigError extends AppError {
  constructor(
    message: string,
    configKey?: string,
    originalError?: Error,
  ) {
    super(
      message,
      ErrorCode.CONFIG_INVALID,
      ErrorSeverity.HIGH,
      { configKey },
      originalError,
    );
    this.name = 'ConfigError';
  }

  getUserMessage(): string {
    if (this.context?.configKey) {
      return `配置项 "${this.context.configKey as string}" 错误: ${this.message}`;
    }
    return this.message;
  }
}

/**
 * 工具函数：包装未知错误为 AppError
 */
export function wrapError(error: unknown, defaultMessage = '操作失败'): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(defaultMessage, ErrorCode.OPERATION_FAILED, ErrorSeverity.MEDIUM, undefined, error);
  }

  return new AppError(
    defaultMessage,
    ErrorCode.UNKNOWN,
    ErrorSeverity.MEDIUM,
    { originalValue: error },
  );
}

/**
 * 工具函数：判断是否为特定错误码
 */
export function isErrorCode(error: unknown, code: ErrorCode): boolean {
  return error instanceof AppError && error.code === code;
}

/**
 * 工具函数：判断错误严重级别
 */
export function getErrorSeverity(error: unknown): ErrorSeverity {
  if (error instanceof AppError) {
    return error.severity;
  }
  return ErrorSeverity.MEDIUM;
}
