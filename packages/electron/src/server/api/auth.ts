import { Request, Response, NextFunction } from 'express';
import { ApiError, ApiErrorCode, HttpStatus } from './errors';

/**
 * Basic Auth 中间件
 *
 * 复用 WebDAV 的用户名/密码（当前硬编码为 webdav/webdav）。
 * CLI 和 MCP 都走这个认证。
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="ONote API"');
    return next(new ApiError(
      HttpStatus.UNAUTHORIZED,
      ApiErrorCode.UNAUTHORIZED,
      'Authentication required',
    ));
  }

  const encoded = authHeader.slice('Basic '.length);
  let decoded: string;
  try {
    decoded = Buffer.from(encoded, 'base64').toString('utf-8');
  } catch {
    return next(new ApiError(
      HttpStatus.UNAUTHORIZED,
      ApiErrorCode.UNAUTHORIZED,
      'Invalid authorization header',
    ));
  }

  const colonIndex = decoded.indexOf(':');
  if (colonIndex === -1) {
    return next(new ApiError(
      HttpStatus.UNAUTHORIZED,
      ApiErrorCode.UNAUTHORIZED,
      'Invalid credentials format',
    ));
  }

  const username = decoded.slice(0, colonIndex);
  const password = decoded.slice(colonIndex + 1);

  // 复用 WebDAV 的凭证（与 app.ts 中 userManager.addUser 一致）
  // TODO: 后续从 setting 中读取，或提供独立的 API 凭证管理
  if (username !== 'webdav' || password !== 'webdav') {
    return next(new ApiError(
      HttpStatus.UNAUTHORIZED,
      ApiErrorCode.UNAUTHORIZED,
      'Invalid credentials',
    ));
  }

  next();
}
