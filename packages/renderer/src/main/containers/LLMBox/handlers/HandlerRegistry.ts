import type { LLMBoxMessage, LLMBoxResponse } from '../types';
import type { createChannel } from 'bidc';
import { getLogger } from '/@/shared/logger';
import {
  HandlerNotFoundError,
  HandlerExecutionError,
  IPCError,
} from '../../../../llmbox/ipc/errors';

type Channel = ReturnType<typeof createChannel>;

const logger = getLogger('HandlerRegistry');

interface HandlerClass<TData = unknown, TResponse = unknown> {
  new (...args: any[]): { handle(data: TData): Promise<TResponse> };
  getMessageType(): string;
}

export class HandlerRegistry {
  private handlers: Map<string, any> = new Map();

  constructor(private channel: Channel) {}

  register<TData, TResponse>(
    HandlerClass: HandlerClass<TData, TResponse>,
    ...args: unknown[]
  ): void {
    const instance = new HandlerClass(...args);
    const messageType = HandlerClass.getMessageType();
    if (this.handlers.has(messageType)) {
      throw new Error(
        `Handler for message type "${messageType}" already registered`,
      );
    }
    this.handlers.set(messageType, instance);
    logger.debug('Handler registered', { messageType });
  }

  async handle(message: LLMBoxMessage): Promise<LLMBoxResponse> {
    const requestId = (message as any).metadata?.requestId || 'unknown';
    const startTime = Date.now();
    const messageType = message.type;

    logger.debug('Handling message', { requestId, type: messageType });

    const handler = this.handlers.get(messageType);
    if (!handler) {
      logger.error('No handler registered', { requestId, type: messageType });
      throw new HandlerNotFoundError(messageType);
    }

    try {
      const response = await handler.handle((message as any).data);
      const duration = Date.now() - startTime;

      logger.debug('Message handled successfully', {
        requestId,
        type: messageType,
        duration,
      });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      // 如果已经是 IPCError，直接抛出
      if (error instanceof IPCError) {
        logger.error('Handler failed with IPC error', {
          requestId,
          type: messageType,
          duration,
          error: error.toJSON(),
        });
        throw error;
      }

      // 包装其他错误
      const handlerError = new HandlerExecutionError(
        messageType,
        requestId,
        error as Error,
      );

      logger.error('Handler failed with unexpected error', {
        requestId,
        type: messageType,
        duration,
        error: String(error),
        stack: (error as Error)?.stack,
      });

      throw handlerError;
    }
  }

  getAllHandlers(): any[] {
    return Array.from(this.handlers.values());
  }

  getHandler(messageType: string): any | undefined {
    return this.handlers.get(messageType);
  }

  serve() {
    this.channel.receive(async (message) => {
      const data = await this.handle(message as any);
      return data as any;
    });
  }
}
