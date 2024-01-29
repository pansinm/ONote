import type { WebContents } from 'electron';

export interface IpcHandlerClass<T extends typeof IpcHandler> {
  new (sender: WebContents): InstanceType<T>;
  initialize(namespace: string): void;
}

abstract class IpcHandler {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static initialize(_namespace: string) {
    // ignore
  }
  constructor(protected sender: WebContents) {}
}

export default IpcHandler;
