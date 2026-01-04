/**
 * ONote 统一错误处理服务
 *
 * 负责捕获、记录、上报和处理应用程序中的所有错误
 */

import { app, BrowserWindow, dialog } from 'electron';
import { AppError, ErrorCode, ErrorSeverity, wrapError } from '/@/shared/errors';
import { getLogger } from '/@/shared/logger';

const logger = getLogger('ErrorHandler');

/**
 * 错误报告
 */
interface ErrorReport {
  timestamp: Date;
  error: AppError;
  userAgent?: string;
  appVersion: string;
  electronVersion: string;
  os?: string;
}

/**
 * 错误处理器选项
 */
interface ErrorHandlerOptions {
  /** 是否显示错误对话框 */
  showErrorDialog?: boolean;
  /** 是否上报错误（预留） */
  enableReporting?: boolean;
  /** 错误上报 URL（预留） */
  reportingUrl?: string;
}

/**
 * 全局错误处理器
 */
class ErrorHandler {
  private options: ErrorHandlerOptions;
  private errorQueue: ErrorReport[] = [];
  private readonly MAX_QUEUE_SIZE = 100;

  constructor(options: ErrorHandlerOptions = {}) {
    this.options = {
      showErrorDialog: true,
      enableReporting: false,
      ...options,
    };

    this.setupGlobalHandlers();
  }

  /**
   * 设置全局错误处理器
   */
  private setupGlobalHandlers(): void {
    // 处理未捕获的异常
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception', error);
      this.handleError(error, ErrorSeverity.CRITICAL);
    });

    // 处理未处理的 Promise rejection
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled rejection', reason, { promise });
      this.handleError(reason, ErrorSeverity.HIGH);
    });

    // 处理渲染进程崩溃
    app.on('render-process-gone', (event, webContents, details) => {
      logger.error('Render process gone', details, { webContents });
      this.handleRenderProcessGone(details);
    });

    // 处理子进程崩溃
    app.on('child-process-gone', (event, details) => {
      logger.error('Child process gone', details);
      this.handleChildProcessGone(details);
    });
  }

  /**
   * 处理渲染进程崩溃
   */
  private handleRenderProcessGone(details: Electron.RenderProcessGoneDetails): void {
    const appError = new AppError(
      '渲染进程崩溃',
      ErrorCode.OPERATION_FAILED,
      ErrorSeverity.CRITICAL,
      {
        reason: details.reason,
        exitCode: details.exitCode,
      },
    );

    this.handleError(appError, ErrorSeverity.CRITICAL);

    // 尝试恢复或提示用户
    if (details.reason === 'crashed') {
      BrowserWindow.getAllWindows().forEach((window) => {
        if (!window.isDestroyed()) {
          dialog.showErrorBox(
            '程序崩溃',
            '渲染进程意外崩溃，即将重新加载。如果问题持续，请联系开发者。',
          );
          window.reload();
        }
      });
    }
  }

  /**
   * 处理子进程崩溃
   */
  private handleChildProcessGone(details: Electron.ChildProcessGoneDetails): void {
    const appError = new AppError(
      '子进程崩溃',
      ErrorCode.OPERATION_FAILED,
      ErrorSeverity.HIGH,
      {
        name: details.name,
        reason: details.reason,
        exitCode: details.exitCode,
        serviceName: details.serviceName,
      },
    );

    this.handleError(appError, ErrorSeverity.HIGH);
  }

  /**
   * 处理错误
   */
  public handleError(
    error: unknown,
    defaultSeverity: ErrorSeverity = ErrorSeverity.MEDIUM,
  ): void {
    const appError = wrapError(error);
    const severity = error instanceof AppError ? error.severity : defaultSeverity;

    // 记录错误日志
    this.logError(appError, severity);

    // 创建错误报告
    const report = this.createErrorReport(appError);

    // 加入队列（用于后续上报）
    this.enqueueReport(report);

    // 显示错误对话框（如果需要）
    if (this.options.showErrorDialog && appError.shouldShowToUser()) {
      this.showErrorDialog(appError);
    }

    // 上报错误（如果启用）
    if (this.options.enableReporting && this.options.reportingUrl) {
      void this.reportError(report);
    }
  }

  /**
   * 记录错误日志
   */
  private logError(error: AppError, severity: ErrorSeverity): void {
    const logMethod = {
      [ErrorSeverity.LOW]: 'debug',
      [ErrorSeverity.MEDIUM]: 'warn',
      [ErrorSeverity.HIGH]: 'error',
      [ErrorSeverity.CRITICAL]: 'error',
    }[severity];

    logger[logMethod as keyof typeof logger](
      error.message,
      error.originalError || error,
      {
        code: error.code,
        severity: error.severity,
        context: error.context,
      },
    );
  }

  /**
   * 创建错误报告
   */
  private createErrorReport(error: AppError): ErrorReport {
    return {
      timestamp: new Date(),
      error,
      userAgent: process.type,
      appVersion: app.getVersion(),
      electronVersion: process.versions.electron,
      os: `${process.platform} ${process.arch}`,
    };
  }

  /**
   * 将错误报告加入队列
   */
  private enqueueReport(report: ErrorReport): void {
    this.errorQueue.push(report);

    // 限制队列大小
    if (this.errorQueue.length > this.MAX_QUEUE_SIZE) {
      this.errorQueue.shift();
    }
  }

  /**
   * 显示错误对话框
   */
  private showErrorDialog(error: AppError): void {
    // 只在主线程显示对话框
    if (process.type !== 'browser') {
      return;
    }

    // 对于高频错误，避免频繁显示对话框
    if (this.isHighFrequencyError(error)) {
      logger.warn('High frequency error, skipping dialog', { error });
      return;
    }

    // 获取当前聚焦的窗口
    const focusedWindow = BrowserWindow.getFocusedWindow();

    if (!focusedWindow) {
      return;
    }

    // 异步显示对话框，避免阻塞
    setImmediate(() => {
      dialog.showErrorBox('错误', error.getUserMessage());
    });
  }

  /**
   * 判断是否为高频错误
   */
  private isHighFrequencyError(error: AppError): boolean {
    const recentErrors = this.errorQueue.slice(-10);
    const sameErrorCount = recentErrors.filter(
      (e) => e.error.code === error.code && e.error.message === error.message,
    ).length;

    return sameErrorCount > 3;
  }

  /**
   * 上报错误（预留接口）
   */
  private async reportError(report: ErrorReport): Promise<void> {
    try {
      if (!this.options.reportingUrl) {
        return;
      }

      logger.info('Reporting error', { report });

      // TODO: 实现错误上报逻辑
      // const response = await fetch(this.options.reportingUrl, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(report),
      // });

      logger.debug('Error reported successfully');
    } catch (err) {
      logger.error('Failed to report error', err);
    }
  }

  /**
   * 获取错误队列
   */
  public getErrorQueue(): ErrorReport[] {
    return [...this.errorQueue];
  }

  /**
   * 清空错误队列
   */
  public clearErrorQueue(): void {
    this.errorQueue = [];
  }

  /**
   * 更新配置
   */
  public updateOptions(options: Partial<ErrorHandlerOptions>): void {
    this.options = { ...this.options, ...options };
  }
}

// 创建全局单例
export const errorHandler = new ErrorHandler({
  showErrorDialog: process.env.NODE_ENV === 'production',
  enableReporting: false, // 暂时禁用错误上报
});

/**
 * 导出便捷函数
 */
export function handleError(error: unknown, severity?: ErrorSeverity): void {
  errorHandler.handleError(error, severity);
}

export function getErrorQueue(): ErrorReport[] {
  return errorHandler.getErrorQueue();
}

export function clearErrorQueue(): void {
  errorHandler.clearErrorQueue();
}
