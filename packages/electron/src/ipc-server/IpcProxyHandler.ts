import type { WebContents } from 'electron';
import IpcHandler, { type IpcHandlerClass } from './IpcHandler';

/**
 * IPC 代理 Handler 配置选项
 */
export interface IpcProxyHandlerOptions {
  /** 白名单：只代理指定的方法 */
  include?: string[];
  /** 黑名单：不代理指定的方法 */
  exclude?: string[];
}

/**
 * IPC 代理 Handler 基类
 *
 * 自动将目标对象的方法转换为 IPC handlers，消除重复的代理代码
 *
 * @template T - 目标对象的类型
 *
 * @example
 * ```typescript
 * // 简单用法：代理所有方法
 * export const dataSourceHandler = new IpcProxyHandler(dataSource, 'DataSource');
 *
 * // 高级用法：使用白名单
 * export const handler = new IpcProxyHandler(
 *   service,
 *   'Service',
 *   { include: ['method1', 'method2'] }
 * );
 *
 * // 高级用法：使用黑名单
 * export const handler = new IpcProxyHandler(
 *   service,
 *   'Service',
 *   { exclude: ['internalMethod'] }
 * );
 * ```
 */
export class IpcProxyHandler<T extends Record<string, any>> extends IpcHandler {
  private proxiedMethods: string[] = [];

  constructor(
    private target: T,
    targetName: string,
    sender: WebContents,
    namespace: string,
    options?: IpcProxyHandlerOptions,
  ) {
    super(sender, namespace);
    this.targetName = targetName;
    this.proxyMethods(options);
  }

  private targetName: string;

  /**
   * 自动代理目标对象的方法
   */
  private proxyMethods(options?: IpcProxyHandlerOptions): void {
    // 获取目标对象原型上的所有方法
    let methods = Object.getOwnPropertyNames(Object.getPrototypeOf(this.target))
      .filter(name => name !== 'constructor' && typeof this.target[name] === 'function');

    // 应用白名单
    if (options?.include) {
      methods = methods.filter(name => options.include!.includes(name));
    }

    // 应用黑名单
    if (options?.exclude) {
      methods = methods.filter(name => !options.exclude!.includes(name));
    }

    // 为每个方法创建代理
    methods.forEach(methodName => {
      (this as any)[methodName] = (...args: any[]) => {
        return this.target[methodName](...args);
      };
    });

    this.proxiedMethods = methods;
  }

  /**
   * 获取已代理的方法列表
   */
  getProxiedMethods(): string[] {
    return [...this.proxiedMethods];
  }

  /**
   * 验证代理的方法是否有效
   *
   * @returns 验证结果，包含是否有效和错误信息
   */
  validateProxy(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    this.proxiedMethods.forEach(methodName => {
      if (typeof this.target[methodName] !== 'function') {
        errors.push(`Method ${methodName} is not a function`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 获取目标对象的引用
   */
  getTarget(): T {
    return this.target;
  }

  /**
   * 获取目标名称
   */
  getTargetName(): string {
    return this.targetName;
  }
}

/**
 * 创建 IPC Proxy Handler 的工厂函数
 *
 * @param target - 目标对象
 * @param targetName - 目标名称（用于日志和调试）
 * @param options - 代理选项
 * @returns Handler 类
 *
 * @example
 * ```typescript
 * export const DataSourceHandlerClass = createIpcProxyHandlerClass(
 *   dataSource,
 *   'DataSource'
 * );
 * ```
 */
export function createIpcProxyHandlerClass<T extends Record<string, any>>(
  target: T,
  targetName: string,
  options?: IpcProxyHandlerOptions,
): IpcHandlerClass<typeof IpcProxyHandler<T>> {
  return class extends IpcProxyHandler<T> {
    constructor(sender: WebContents, namespace: string) {
      super(target, targetName, sender, namespace, options);
    }

    static override initialize(namespace: string): void {
      // 可以在这里添加初始化逻辑
      console.log(`[IpcProxyHandler] Initializing ${targetName} for namespace: ${namespace}`);
    }
  };
}

export default IpcProxyHandler;
