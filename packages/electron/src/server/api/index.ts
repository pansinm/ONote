import { Router, Request, Response, NextFunction } from 'express';
import * as url from 'url';
import * as path from 'path';
import { dataSource } from '/@/dataSource';
import { authMiddleware } from './auth';
import { ok, fail, ApiError, ApiErrorCode, HttpStatus } from './errors';
import { getLogger } from '/@/shared/logger';

const logger = getLogger('API');
const router = Router();

// 认证：所有 /api/v1/* 都需要 Basic Auth
router.use(authMiddleware);

// ──── 路径解析工具 ────

/**
 * 把用户输入的相对/绝对路径转换为 file:// URI
 *
 * 规则：
 *   - 以 / 开头 → 绝对路径，直接转 file://
 *   - 其他 → 相对于 rootDir
 */
function resolveUri(inputPath: string): string {
  const rootUri = dataSource.getRootDirUri();
  if (!rootUri) {
    throw new ApiError(HttpStatus.INTERNAL_ERROR, ApiErrorCode.INTERNAL_ERROR, 'Root directory not configured');
  }

  // 已是 file:// URI → 直接用
  if (inputPath.startsWith('file://')) {
    return inputPath;
  }

  // 绝对路径 → 直接转
  if (inputPath.startsWith('/')) {
    return url.pathToFileURL(inputPath).toString();
  }

  // 相对路径 → 拼接 rootDir
  const rootPath = url.fileURLToPath(rootUri);
  const absolutePath = path.resolve(rootPath, inputPath);
  return url.pathToFileURL(absolutePath).toString();
}

/**
 * 从 req.params[0] 里取出通配符匹配的路径段
 */
function getWildcardPath(req: Request): string {
  // Express 的 * 通配符路由会把匹配内容放在 req.params[0]
  const wildcard = req.params[0] || '';
  return decodeURIComponent(wildcard);
}

// ──── GET /api/v1/notes ──── 列出目录 ────

router.get('/notes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const targetPath = typeof req.query.path === 'string' ? req.query.path : undefined;
    const targetUri = targetPath ? resolveUri(targetPath) : dataSource.getRootDirUri();

    const nodes = await dataSource.listDir(targetUri);
    ok(res, nodes);
  } catch (err) {
    next(err);
  }
});

// ──── GET /api/v1/notes/* ──── 读取笔记 ────

router.get('/notes/*', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 排除根路径 /api/v1/notes（不带路径）的匹配——交给上面的 /notes handler
    const filePath = getWildcardPath(req);
    if (!filePath) {
      return ok(res, []);
    }

    const fileUri = resolveUri(filePath);

    // 检查是文件还是目录
    const treeNode = await dataSource.getTreeNode(fileUri);

    if (treeNode.type === 'directory') {
      const nodes = await dataSource.listDir(fileUri);
      return ok(res, nodes);
    }

    const content = await dataSource.readText(fileUri);
    ok(res, {
      uri: fileUri,
      name: treeNode.name,
      content,
      mtime: treeNode.mtime,
    });
  } catch (err) {
    // DataSource 抛的 ENOENT 等 Node 错误 → 包装成 404
    if (err instanceof Error && 'code' in err && (err as any).code === 'ENOENT') {
      return fail(res, HttpStatus.NOT_FOUND, ApiErrorCode.NOT_FOUND, 'Note not found');
    }
    next(err);
  }
});

// ──── PUT /api/v1/notes/* ──── 写入/创建笔记 ────

router.put('/notes/*', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filePath = getWildcardPath(req);
    if (!filePath) {
      return fail(res, HttpStatus.BAD_REQUEST, ApiErrorCode.VALIDATION_ERROR, 'Path is required');
    }

    const content = req.body?.content;
    if (typeof content !== 'string') {
      return fail(res, HttpStatus.BAD_REQUEST, ApiErrorCode.VALIDATION_ERROR, 'Request body must contain { content: string }');
    }

    const fileUri = resolveUri(filePath);
    await dataSource.writeText(fileUri, content);

    const treeNode = await dataSource.getTreeNode(fileUri);
    ok(res, {
      uri: fileUri,
      name: treeNode.name,
      mtime: treeNode.mtime,
    });
  } catch (err) {
    next(err);
  }
});

// ──── DELETE /api/v1/notes/* ──── 删除笔记/目录 ────

router.delete('/notes/*', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filePath = getWildcardPath(req);
    if (!filePath) {
      return fail(res, HttpStatus.BAD_REQUEST, ApiErrorCode.VALIDATION_ERROR, 'Path is required');
    }

    const fileUri = resolveUri(filePath);
    await dataSource.delete(fileUri);
    ok(res, { deleted: true });
  } catch (err) {
    if (err instanceof Error && 'code' in err && (err as any).code === 'ENOENT') {
      return fail(res, HttpStatus.NOT_FOUND, ApiErrorCode.NOT_FOUND, 'Note not found');
    }
    next(err);
  }
});

// ──── POST /api/v1/notes/*/rename ──── 重命名 ────

router.post('/notes/*/rename', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 从 URL 中提取路径段，去掉末尾的 /rename
    const fullPath = req.path.replace(/^\/api\/v1\/notes\//, '').replace(/\/rename$/, '');
    const decodedPath = decodeURIComponent(fullPath);

    if (!decodedPath) {
      return fail(res, HttpStatus.BAD_REQUEST, ApiErrorCode.VALIDATION_ERROR, 'Path is required');
    }

    const newName = req.body?.name;
    if (!newName || typeof newName !== 'string') {
      return fail(res, HttpStatus.BAD_REQUEST, ApiErrorCode.VALIDATION_ERROR, 'Request body must contain { name: string }');
    }

    const fileUri = resolveUri(decodedPath);
    const result = await dataSource.rename(fileUri, newName);
    ok(res, result);
  } catch (err) {
    if (err instanceof Error && 'code' in err && (err as any).code === 'ENOENT') {
      return fail(res, HttpStatus.NOT_FOUND, ApiErrorCode.NOT_FOUND, 'Note not found');
    }
    next(err);
  }
});

// ──── POST /api/v1/notes/*/move ──── 移动 ────

router.post('/notes/*/move', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fullPath = req.path.replace(/^\/api\/v1\/notes\//, '').replace(/\/move$/, '');
    const decodedPath = decodeURIComponent(fullPath);

    if (!decodedPath) {
      return fail(res, HttpStatus.BAD_REQUEST, ApiErrorCode.VALIDATION_ERROR, 'Path is required');
    }

    const targetDir = req.body?.targetDir;
    if (!targetDir || typeof targetDir !== 'string') {
      return fail(res, HttpStatus.BAD_REQUEST, ApiErrorCode.VALIDATION_ERROR, 'Request body must contain { targetDir: string }');
    }

    const sourceUri = resolveUri(decodedPath);
    const targetDirUri = resolveUri(targetDir);
    const result = await dataSource.move(sourceUri, targetDirUri);
    ok(res, result);
  } catch (err) {
    if (err instanceof Error && 'code' in err && (err as any).code === 'ENOENT') {
      return fail(res, HttpStatus.NOT_FOUND, ApiErrorCode.NOT_FOUND, 'Note not found');
    }
    next(err);
  }
});

// ──── POST /api/v1/notes/*/append ──── 追加内容 ────

router.post('/notes/*/append', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fullPath = req.path.replace(/^\/api\/v1\/notes\//, '').replace(/\/append$/, '');
    const decodedPath = decodeURIComponent(fullPath);

    if (!decodedPath) {
      return fail(res, HttpStatus.BAD_REQUEST, ApiErrorCode.VALIDATION_ERROR, 'Path is required');
    }

    const content = req.body?.content;
    if (typeof content !== 'string') {
      return fail(res, HttpStatus.BAD_REQUEST, ApiErrorCode.VALIDATION_ERROR, 'Request body must contain { content: string }');
    }

    const fileUri = resolveUri(decodedPath);

    // 读 → 拼 → 写（DataSource 没有 append 原子操作）
    // TODO: 给 DataSource 添加原子 append 方法
    const existing = await dataSource.readText(fileUri);
    await dataSource.writeText(fileUri, existing + '\n' + content);

    ok(res, { appended: true });
  } catch (err) {
    if (err instanceof Error && 'code' in err && (err as any).code === 'ENOENT') {
      return fail(res, HttpStatus.NOT_FOUND, ApiErrorCode.NOT_FOUND, 'Note not found');
    }
    next(err);
  }
});

// ──── POST /api/v1/mkdir/* ──── 创建目录 ────

router.post('/mkdir/*', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dirPath = getWildcardPath(req);
    if (!dirPath) {
      return fail(res, HttpStatus.BAD_REQUEST, ApiErrorCode.VALIDATION_ERROR, 'Path is required');
    }

    const dirUri = resolveUri(dirPath);
    await dataSource.mkdir(dirUri);
    ok(res, { created: true });
  } catch (err) {
    next(err);
  }
});

// ──── GET /api/v1/search ──── 搜索 ────

router.get('/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query.q;
    if (!query || typeof query !== 'string') {
      return fail(res, HttpStatus.BAD_REQUEST, ApiErrorCode.VALIDATION_ERROR, 'Query parameter "q" is required');
    }

    const rootUri = dataSource.getRootDirUri();
    const results = await dataSource.search(rootUri, query);
    ok(res, results);
  } catch (err) {
    next(err);
  }
});

export default router;
