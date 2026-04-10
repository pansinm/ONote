import { Request, Response, NextFunction } from 'express';

/**
 * REST API 统一错误码
 */
export enum ApiErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

/**
 * HTTP status → ApiErrorCode 的映射
 */
export const HttpStatus = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
} as const;

/**
 * API 业务异常
 */
export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: ApiErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * 统一成功响应
 */
export function ok<T>(res: Response, data: T) {
  return res.json({ ok: true, data });
}

/**
 * 统一错误响应
 */
export function fail(res: Response, statusCode: number, code: ApiErrorCode, message: string) {
  return res.status(statusCode).json({
    ok: false,
    error: { code, message },
  });
}

/**
 * Express 错误处理中间件 — 挂在所有 API 路由之后
 */
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return fail(res, err.statusCode, err.code, err.message);
  }
  console.error('[API] Unexpected error:', err);
  return fail(res, 500, ApiErrorCode.INTERNAL_ERROR, 'Internal server error');
}
