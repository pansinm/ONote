import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import { dataSource } from '/@/dataSource';
import * as url from 'url';
import * as path from 'path';
import { getLogger } from '/@/shared/logger';
import type { IncomingMessage, ServerResponse } from 'http';

const logger = getLogger('MCP');

// ──── 路径解析（与 REST API 保持一致） ────

function resolveUri(inputPath: string): string {
  const rootUri = dataSource.getRootDirUri();
  if (!rootUri) throw new Error('Root directory not configured');
  if (inputPath.startsWith('file://')) return inputPath;
  if (inputPath.startsWith('/')) return url.pathToFileURL(inputPath).toString();
  const rootPath = url.fileURLToPath(rootUri);
  return url.pathToFileURL(path.resolve(rootPath, inputPath)).toString();
}

// ──── Tool 注册（factory 函数，为每个 MCP session 创建独立的 McpServer） ────

function registerTools(server: McpServer) {
  server.tool(
    'list_notes',
    'List all notes and directories in a given path. Returns a JSON array of items with name, type, and uri.',
    { path: z.string().optional().describe('Directory path relative to notes root. Defaults to root.') },
    async ({ path: dirPath }) => {
      const targetUri = dirPath ? resolveUri(dirPath) : dataSource.getRootDirUri();
      const nodes = await dataSource.listDir(targetUri);
      const items = nodes.map(n => ({
        name: n.name,
        type: n.type,
        uri: n.uri,
        ...(n.mtime ? { mtime: n.mtime } : {}),
      }));
      return { content: [{ type: 'text' as const, text: JSON.stringify(items, null, 2) }] };
    },
  );

  server.tool(
    'read_note',
    'Read the full content of a note file.',
    { path: z.string().describe('Path to the note file, relative to notes root.') },
    async ({ path: filePath }) => {
      const fileUri = resolveUri(filePath);
      const content = await dataSource.readText(fileUri);
      return { content: [{ type: 'text' as const, text: content }] };
    },
  );

  server.tool(
    'write_note',
    'Create or overwrite a note file with the given content.',
    {
      path: z.string().describe('Path to the note file, relative to notes root.'),
      content: z.string().describe('The content to write.'),
    },
    async ({ path: filePath, content }) => {
      const fileUri = resolveUri(filePath);
      await dataSource.writeText(fileUri, content);
      return { content: [{ type: 'text' as const, text: `Written to ${filePath}` }] };
    },
  );

  server.tool(
    'append_note',
    'Append content to an existing note. Adds a newline before the appended text.',
    {
      path: z.string().describe('Path to the note file, relative to notes root.'),
      content: z.string().describe('Content to append.'),
    },
    async ({ path: filePath, content }) => {
      const fileUri = resolveUri(filePath);
      const existing = await dataSource.readText(fileUri);
      await dataSource.writeText(fileUri, existing + '\n' + content);
      return { content: [{ type: 'text' as const, text: `Appended to ${filePath}` }] };
    },
  );

  server.tool(
    'delete_note',
    'Delete a note file or directory.',
    { path: z.string().describe('Path to delete, relative to notes root.') },
    async ({ path: filePath }) => {
      const fileUri = resolveUri(filePath);
      await dataSource.delete(fileUri);
      return { content: [{ type: 'text' as const, text: `Deleted ${filePath}` }] };
    },
  );

  server.tool(
    'search_notes',
    'Search notes by keyword. Searches file names recursively.',
    { query: z.string().describe('Search keyword.') },
    async ({ query }) => {
      const rootUri = dataSource.getRootDirUri();
      const results = await dataSource.search(rootUri, query);
      const items = results.map(n => ({ name: n.name, type: n.type, uri: n.uri }));
      return { content: [{ type: 'text' as const, text: JSON.stringify(items, null, 2) }] };
    },
  );

  server.tool(
    'rename_note',
    'Rename a note or directory.',
    {
      path: z.string().describe('Current path, relative to notes root.'),
      newName: z.string().describe('New name (filename only, not a full path).'),
    },
    async ({ path: filePath, newName }) => {
      const fileUri = resolveUri(filePath);
      const result = await dataSource.rename(fileUri, newName);
      return { content: [{ type: 'text' as const, text: `Renamed to ${result.name}` }] };
    },
  );

  server.tool(
    'move_note',
    'Move a note or directory to a different directory.',
    {
      path: z.string().describe('Source path, relative to notes root.'),
      targetDir: z.string().describe('Target directory, relative to notes root.'),
    },
    async ({ path: filePath, targetDir }) => {
      const sourceUri = resolveUri(filePath);
      const targetDirUri = resolveUri(targetDir);
      const result = await dataSource.move(sourceUri, targetDirUri);
      return { content: [{ type: 'text' as const, text: `Moved to ${result.uri}` }] };
    },
  );

  server.tool(
    'create_directory',
    'Create a new directory.',
    { path: z.string().describe('Directory path to create, relative to notes root.') },
    async ({ path: dirPath }) => {
      const dirUri = resolveUri(dirPath);
      await dataSource.mkdir(dirUri);
      return { content: [{ type: 'text' as const, text: `Created directory ${dirPath}` }] };
    },
  );

  server.tool(
    'get_note_info',
    'Get metadata about a note or directory (name, type, mtime).',
    { path: z.string().describe('Path, relative to notes root.') },
    async ({ path: filePath }) => {
      const fileUri = resolveUri(filePath);
      const node = await dataSource.getTreeNode(fileUri);
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({ name: node.name, type: node.type, uri: node.uri, mtime: node.mtime }, null, 2),
        }],
      };
    },
  );
}

// ──── 请求处理 ────

/**
 * 为每个 MCP 请求创建独立的 server + transport（stateless 模式）。
 *
 * 为什么每次都创建新的？
 * - MCP SDK v1 的 Streamable HTTP transport 在 stateless 模式下不能跨请求复用
 * - 每个 transport 只能连一个 McpServer 实例（connect 是一次性的）
 * - 创建开销极低：只是注册了一些 handler，没有 I/O
 */
async function handleMcpPostRequest(req: IncomingMessage, res: ServerResponse, body: unknown) {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless
  });

  const mcpServer = new McpServer({
    name: 'onote',
    version: '0.14.0',
  });

  registerTools(mcpServer);

  try {
    await mcpServer.connect(transport);
    await transport.handleRequest(req, res, body);
  } catch (err) {
    logger.error('MCP request error:', err);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal MCP error' }));
    }
  }
}

/**
 * Express 请求处理函数 — 支持 POST（JSON-RPC）、GET（SSE）、DELETE（terminate）
 */
export async function handleMcpRequest(req: IncomingMessage, res: ServerResponse) {
  const method = req.method?.toUpperCase();

  if (method === 'POST') {
    const body = (req as any).body || {};
    await handleMcpPostRequest(req, res, body);
  } else if (method === 'GET') {
    // stateless 模式不支持 SSE 持久连接，返回 405
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'SSE not supported in stateless mode. Use POST for all requests.' }));
  } else if (method === 'DELETE') {
    // stateless 模式没有 session，直接返回 200
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
  } else {
    res.writeHead(405);
    res.end();
  }
}

logger.info('MCP handler ready (stateless, per-request transport)');
