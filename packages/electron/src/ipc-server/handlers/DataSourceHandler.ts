import IpcHandler from '../IpcHandler';
import type { WebContents } from 'electron';
import { dataSource } from '/@/dataSource';
import { getLogger } from '/@/shared/logger';

const logger = getLogger('DataSourceHandler');

/**
 * DataSource Handler
 *
 * 使用代理模式自动将 dataSource 对象的方法转换为 IPC handlers
 * 避免手动编写重复的代理方法
 */
class DataSourceHandler extends IpcHandler {
  constructor(sender: WebContents, namespace: string) {
    super(sender, namespace);
    this.proxyMethods();
  }

  private proxyMethods(): void {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(dataSource))
      .filter(name => name !== 'constructor' && typeof dataSource[name as keyof typeof dataSource] === 'function');

    methods.forEach(methodName => {
      (DataSourceHandler.prototype as any)[methodName] = (...args: unknown[]) => {
        logger.debug(`Proxying method: ${methodName}`, { args: args.length });
        return (dataSource as any)[methodName](...args);
      };
    });

    logger.info(`Proxied ${methods.length} methods from dataSource`);
  }
}

export default DataSourceHandler;
