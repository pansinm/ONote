/**
 * ONote 统一日志系统
 *
 * 基于 electron-log 实现跨进程的统一日志管理
 * 提供日志级别控制、格式化输出、文件记录等功能
 */

import log from 'electron-log';
import path from 'path';
import { app } from 'electron';

/**
 * 日志级别
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * 日志配置
 */
export interface LoggerConfig {
  level: LogLevel;
  format?: boolean;
  fileOptions?: {
    logPath?: string;
    maxSize?: number;
    fileLevel?: LogLevel;
  };
}

/**
 * 默认配置
 */
const defaultConfig: LoggerConfig = {
  level: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
  format: true,
  fileOptions: {
    logPath: path.join(app.getPath('logs'), 'onote.log'),
    maxSize: 10 * 1024 * 1024, // 10MB
    fileLevel: LogLevel.INFO,
  },
};

/**
 * 当前配置
 */
let currentConfig: LoggerConfig = { ...defaultConfig };

/**
 * 日志记录器类
 */
class Logger {
  private context: string;

  constructor(context = 'ONote') {
    this.context = context;
  }

  /**
   * 格式化日志消息
   */
  private formatMessage(level: LogLevel, message: string, ...args: any[]): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${this.context}]`;

    if (args.length === 0) {
      return `${prefix} ${message}`;
    }

    // 格式化额外参数
    const formattedArgs = args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');

    return `${prefix} ${message} ${formattedArgs}`;
  }

  /**
   * 检查是否应该记录此级别的日志
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const currentLevelIndex = levels.indexOf(currentConfig.level);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  /**
   * 记录调试级别日志
   */
  debug(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const formatted = this.formatMessage(LogLevel.DEBUG, message, ...args);
      log.debug(formatted);
      if (currentConfig.format) {
        console.debug(formatted);
      }
    }
  }

  /**
   * 记录信息级别日志
   */
  info(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const formatted = this.formatMessage(LogLevel.INFO, message, ...args);
      log.info(formatted);
      if (currentConfig.format) {
        console.info(formatted);
      }
    }
  }

  /**
   * 记录警告级别日志
   */
  warn(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const formatted = this.formatMessage(LogLevel.WARN, message, ...args);
      log.warn(formatted);
      if (currentConfig.format) {
        console.warn(formatted);
      }
    }
  }

  /**
   * 记录错误级别日志
   */
  error(message: string, error?: Error | unknown, ...args: any[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      let formatted = this.formatMessage(LogLevel.ERROR, message);

      // 处理错误对象
      if (error instanceof Error) {
        formatted += `\n  Error: ${error.message}`;
        if (error.stack) {
          formatted += `\n  Stack: ${error.stack}`;
        }
      } else if (error) {
        formatted += ` ${String(error)}`;
      }

      // 处理额外参数
      if (args.length > 0) {
        const formattedArgs = args.map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg),
        ).join(' ');
        formatted += `\n  ${formattedArgs}`;
      }

      log.error(formatted);
      if (currentConfig.format) {
        console.error(formatted);
      }
    }
  }

  /**
   * 创建子日志记录器
   */
  createChild(childContext: string): Logger {
    const newContext = `${this.context}:${childContext}`;
    return new Logger(newContext);
  }
}

/**
 * 全局默认日志记录器
 */
const defaultLogger = new Logger();

/**
 * 配置日志系统
 */
export function configureLogger(config: Partial<LoggerConfig>): void {
  currentConfig = { ...currentConfig, ...config };

  // 配置 electron-log
  if (currentConfig.fileOptions) {
    log.transports.file.level = currentConfig.fileOptions.fileLevel || LogLevel.INFO;
    log.transports.file.maxSize = currentConfig.fileOptions.maxSize || 10485760;

    if (currentConfig.fileOptions.logPath) {
      log.transports.file.resolvePathFn = () => currentConfig.fileOptions!.logPath!;
    }
  }

  // 设置控制台日志级别
  log.transports.console.level = currentConfig.level;

  defaultLogger.info('Logger configured', { level: currentConfig.level });
}

/**
 * 获取日志记录器实例
 */
export function getLogger(context?: string): Logger {
  if (context) {
    return defaultLogger.createChild(context);
  }
  return defaultLogger;
}

/**
 * 快捷方法
 */
export const logger = {
  debug: (message: string, ...args: any[]) => defaultLogger.debug(message, ...args),
  info: (message: string, ...args: any[]) => defaultLogger.info(message, ...args),
  warn: (message: string, ...args: any[]) => defaultLogger.warn(message, ...args),
  error: (message: string, error?: Error | unknown, ...args: any[]) =>
    defaultLogger.error(message, error, ...args),
};

/**
 * 初始化日志系统
 */
export function initLogger(config?: Partial<LoggerConfig>): void {
  if (config) {
    configureLogger(config);
  }

  // 捕获全局错误
  if (typeof process !== 'undefined') {
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception', error);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection', reason, { promise });
    });
  }

  defaultLogger.info('Logger initialized');
}

// 导出默认配置供外部使用
export { defaultConfig };

// 导出 Logger 类供外部扩展
export { Logger };

// 默认导出
export default logger;
