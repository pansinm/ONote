/**
 * React 错误边界组件
 *
 * 捕获子组件树中的 JavaScript 错误，记录错误日志，并显示备用 UI
 */

import type { ErrorInfo, ReactNode } from 'react';
import React, { Component } from 'react';
import type { AppError} from '/@/shared/errors';
import { wrapError } from '/@/shared/errors';
import { getLogger } from '/@/shared/logger';

const logger = getLogger('ErrorBoundary');

interface ErrorBoundaryProps {
  children: ReactNode;
  /** 发生错误时显示的 fallback UI */
  fallback?: ReactNode | ((error: AppError, retry: () => void) => ReactNode);
  /** 错误回调 */
  onError?: (error: AppError, errorInfo: ErrorInfo) => void;
  /** 是否显示详细信息（开发模式默认 true，生产模式默认 false） */
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: AppError | null;
}

/**
 * 错误边界组件
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): { hasError: boolean; error: AppError } {
    return {
      hasError: true,
      error: wrapError(error),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const appError = wrapError(error);

    // 记录错误日志
    logger.error('React component error', appError, {
      componentStack: errorInfo.componentStack,
    });

    // 调用错误回调
    this.props.onError?.(appError, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // 如果提供了自定义 fallback
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback(this.state.error, this.handleReset);
        }
        return this.props.fallback;
      }

      // 默认错误 UI
      return <DefaultErrorUI error={this.state.error} retry={this.handleReset} />;
    }

    return this.props.children;
  }
}

/**
 * 默认错误 UI 组件
 */
interface DefaultErrorUIProps {
  error: AppError;
  retry: () => void;
}

const DefaultErrorUI: React.FC<DefaultErrorUIProps> = ({ error, retry }) => {
  const showDetails =
    process.env.NODE_ENV === 'development' || error.severity === 'high';

  return (
    <div
      style={{
        padding: '20px',
        margin: '20px',
        border: '1px solid #f5c6cb',
        borderRadius: '4px',
        backgroundColor: '#f8d7da',
        color: '#721c24',
      }}
    >
      <h3>⚠️ 出错了</h3>
      <p style={{ marginTop: '10px' }}>{error.getUserMessage()}</p>

      {showDetails && (
        <details style={{ marginTop: '15px' }}>
          <summary
            style={{ cursor: 'pointer', fontWeight: 'bold' }}
            onClick={(e) => e.preventDefault()}
          >
            详细信息
          </summary>
          <div
            style={{
              marginTop: '10px',
              padding: '10px',
              backgroundColor: '#fff',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}
          >
            <div>
              <strong>错误类型:</strong> {error.name}
            </div>
            <div style={{ marginTop: '5px' }}>
              <strong>错误消息:</strong> {error.message}
            </div>
            {error.code && (
              <div style={{ marginTop: '5px' }}>
                <strong>错误码:</strong> {error.code}
              </div>
            )}
            {error.context && Object.keys(error.context).length > 0 && (
              <div style={{ marginTop: '5px' }}>
                <strong>上下文:</strong>
                <pre style={{ margin: '5px 0 0 0' }}>
                  {JSON.stringify(error.context, null, 2)}
                </pre>
              </div>
            )}
            {error.stack && (
              <div style={{ marginTop: '10px' }}>
                <strong>堆栈跟踪:</strong>
                <pre style={{ margin: '5px 0 0 0', maxHeight: '200px', overflow: 'auto' }}>
                  {error.stack}
                </pre>
              </div>
            )}
          </div>
        </details>
      )}

      <div style={{ marginTop: '15px' }}>
        <button
          onClick={retry}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#0056b3';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#007bff';
          }}
        >
          重试
        </button>
      </div>
    </div>
  );
};

/**
 * Hook 版本的错误边界（用于函数组件）
 */
export const useErrorHandler = (error: Error | null): void => {
  if (error) {
    throw error;
  }
};

/**
 * 高阶组件：为组件添加错误边界
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>,
): React.ComponentType<P> {
  const WithErrorBoundary: React.ComponentType<P> = (props) => {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };

  WithErrorBoundary.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithErrorBoundary;
}

export default ErrorBoundary;
