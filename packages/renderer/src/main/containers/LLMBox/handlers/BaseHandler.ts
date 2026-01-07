import type { LLMBoxResponse } from '../types';
import { getLogger } from '/@/shared/logger';

export interface MessageHandler<TData, TResponse> {
  handle(data: TData): Promise<TResponse>;
}

export abstract class BaseHandler {
  protected logger = getLogger(this.constructor.name);

  protected async wrapWithErrorHandling<R extends LLMBoxResponse>(
    handler: () => Promise<R>,
    errorMessage: string,
  ): Promise<R> {
    return handler().catch((error) => {
      const errorResponse = {
          error: error instanceof Error ? error.message : errorMessage,
        } as R;
      this.logger.error(errorMessage, error);
      return errorResponse;
    });
  }
}
