import IpcHandler from '../IpcHandler';
import type { WebContents } from 'electron';
import { dataSource } from '/@/dataSource';
import { getLogger } from '/@/shared/logger';

const logger = getLogger('DataSourceHandler');

class DataSourceHandler extends IpcHandler {
  constructor(sender: WebContents, namespace: string) {
    super(sender, namespace);
  }

  static {
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
