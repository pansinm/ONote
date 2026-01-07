import type { LLMBoxMessage, LLMBoxResponse } from '../types';

export class HandlerRegistry {
  private handlers: Map<string, any> = new Map();

  register<TData, TResponse>(handler: {
    handle(data: TData): Promise<TResponse>;
    getMessageType: () => string;
  }): void {
    const messageType = handler.getMessageType();
    if (this.handlers.has(messageType)) {
      throw new Error(`Handler for message type "${messageType}" already registered`);
    }
    this.handlers.set(messageType, handler);
  }

  async handle(message: LLMBoxMessage): Promise<LLMBoxResponse | undefined> {
    const handler = this.handlers.get(message.type);
    if (!handler) {
      console.warn(`[HandlerRegistry] No handler registered for message type: ${message.type}`);
      return undefined;
    }

    return handler.handle((message as any).data);
  }

  getAllHandlers(): any[] {
    return Array.from(this.handlers.values());
  }

  getHandler(messageType: string): any | undefined {
    return this.handlers.get(messageType);
  }
}
