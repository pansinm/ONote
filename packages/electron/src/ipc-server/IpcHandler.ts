import type { WebContents } from 'electron';

export interface IpcHandlerClass<T extends typeof IpcHandler> {
  new (sender: WebContents, namespace: string): InstanceType<T>;
  initialize(namespace: string): void;
}

abstract class IpcHandler {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static initialize(_namespace: string) {
    // ignore
  }

  constructor(protected sender: WebContents, protected namespace: string) {}

  send(channel: string, ...args: any[]): void {
    this.sender.send(`${this.namespace}.${channel}`, ...args);
  }
}

export default IpcHandler;
