# ONote CLI + MCP Server 方案

## 一句话定位

**让 ONote 成为一个「可编程的笔记本」——不只是人用，Agent 也能用。**

---

## 1. 为什么做这件事

你有一个 WebDAV 服务器已经跑在 `localhost:21221`，你有 `.claude/skills/onote/SKILL.md` 让 Claude 通过 curl 杂耍 WebDAV。这个方向是对的，但执行得不够好：

1. **WebDAV 太底层**——Agent 要自己拼 curl、处理认证、解析 XML。每个 Agent 都要重复做这件事。
2. **没有真正的 CLI**——`scripts/cli/onote` 只是个启动 GUI 的 shell 脚本。用户无法在终端操作笔记。
3. **两个问题，一个答案**——CLI 人类用，MCP Agent 用，底层共享同一套 API。

---

## 2. 架构总览

```
┌─────────────────────────────────────────────────────┐
│                    外部消费者                          │
│   人类 (终端)          外部 Agent (Claude/GPT/...)     │
│      │                        │                       │
│   `onote` CLI            MCP Client                   │
│      │                   (stdio/HTTP)                  │
└──────┼────────────────────────┼───────────────────────┘
       │                        │
       ▼                        ▼
┌──────────────────────────────────────────────────────┐
│              ONote API Layer (HTTP)                    │
│              localhost:21221/api/*                     │
│                                                        │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ REST API    │  │ MCP Server   │  │ WebDAV       │ │
│  │ /api/v1/*   │  │ /api/mcp     │  │ / (existing) │ │
│  └──────┬──────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                │                  │         │
│         ▼                ▼                  ▼         │
│  ┌──────────────────────────────────────────────────┐ │
│  │          DataSource (已有的核心数据层)              │ │
│  │   read / write / delete / rename / move / search  │ │
│  │   listDir / mkdir / getTreeNode                   │ │
│  └──────────────────────────────────────────────────┘ │
│                        │                               │
│                   Electron Main Process                │
└──────────────────────────────────────────────────────┘
```

**核心设计原则：CLI 是 HTTP API 的一等消费者，MCP Server 也是。三层共用一个数据层。**

---

## 3. 三层设计

### 3.1 REST API（核心层）

在现有 Express 服务器 (`packages/electron/src/server/app.ts`) 上新增 `/api/v1` 路由。

**为什么选 REST API 而不是 IPC/socket？**
- Electron 主进程已经用 Express 监听 `21221` 端口
- HTTP 是最通用的协议——CLI、MCP、curl、浏览器拓展、任何语言都能调
- 不需要额外的 socket 层，不需要 Electron app running 才能工作的限制（WebDAV 服务器已经在做了）

**认证：复用 WebDAV 的 HTTP Basic Auth（setting 里的 webdav/webdav）。**

#### API 端点设计

```
GET    /api/v1/notes                    # 列出笔记树（可选 ?path= 子目录）
GET    /api/v1/notes/:path              # 读取笔记内容
PUT    /api/v1/notes/:path              # 写入/创建笔记（body = content）
DELETE /api/v1/notes/:path              # 删除笔记/目录
POST   /api/v1/notes/:path/rename       # 重命名 { name: "new.md" }
POST   /api/v1/notes/:path/move         # 移动 { targetDir: "file:///..." }
GET    /api/v1/search?q=keyword         # 搜索笔记
POST   /api/v1/mkdir/:path             # 创建目录
```

**输出格式**：统一 JSON

```json
// GET /api/v1/notes
{
  "ok": true,
  "data": [
    { "uri": "file:///Users/...", "name": "daily.md", "type": "file", "mtime": 1712678400000 },
    { "uri": "file:///Users/...", "name": "projects", "type": "directory" }
  ]
}

// GET /api/v1/notes/daily.md
{
  "ok": true,
  "data": {
    "uri": "file:///Users/...",
    "name": "daily.md",
    "content": "# Daily Note\n\nHello world",
    "mtime": 1712678400000
  }
}

// Error
{
  "ok": false,
  "error": { "code": "NOT_FOUND", "message": "Note not found" }
}
```

**实现位置**：`packages/electron/src/server/api/` 新目录，挂载到 `app.ts`。

```typescript
// packages/electron/src/server/api/index.ts
import { Router } from 'express';
import { dataSource } from '/@/dataSource';

const router = Router();

router.get('/notes', async (req, res) => {
  const rootUri = dataSource.getRootDirUri();
  const path = req.query.path ? req.query.path as string : rootUri;
  const nodes = await dataSource.listDir(path);
  res.json({ ok: true, data: nodes });
});

router.get('/notes/*', async (req, res) => { ... });
router.put('/notes/*', async (req, res) => { ... });
// ...
export default router;
```

### 3.2 CLI（人类用）

**独立 npm binary**，不依赖 Electron 进程启动速度，直接调 HTTP API。

```
packages/cli/
  src/
    index.ts          # 入口：解析参数、调 API、格式化输出
    client.ts         # HTTP client（封装认证、baseURL）
    commands/
      list.ts         # onote ls [--path DIR]
      cat.ts          # onote cat <path>
      write.ts        # onote write <path> [--content TEXT | --file FILE]
      rm.ts           # onote rm <path>
      mv.ts           # onote mv <src> <dest>
      search.ts       # onote search <keyword>
      mkdir.ts        # onote mkdir <path>
      append.ts       # onote append <path> --content TEXT
  package.json
  tsconfig.json
```

#### CLI 命令设计

```bash
# ========== 笔记 CRUD ==========
# 列出笔记
onote ls                          # 列根目录
onote ls --path projects/         # 列子目录
onote ls --json                   # JSON 输出（供 script 用）

# 读取笔记
onote cat daily.md                # 输出到 stdout
onote cat daily.md --json         # 含元数据

# 创建/覆盖笔记
onote write daily.md              # 从 stdin 读
onote write daily.md -c "# Hello" # 直接写
echo "content" | onote write daily.md

# 追加内容
onote append daily.md -c "\n## New Section\n- item"

# 删除笔记
onote rm old-note.md
onote rm --recursive projects/old # 删目录

# 移动/重命名
onote mv old.md new.md
onote mv note.md projects/        # 移到目录

# 搜索
onote search "关键词"
onote search "meeting" --json

# 创建目录
onote mkdir archive/2024

# ========== 应用控制 ==========
# 打开 GUI（保持向后兼容）
onote open [file...]              # 打开 GUI 并可选打开文件
onote open --new                  # 新窗口

# 信息
onote status                      # 检查 ONote 是否运行、端口、根目录
onote config                      # 显示当前配置
onote --version
onote --help
```

**连接发现**：
- CLI 先查 `~/.onote/config.json`（里面存 `port` 和 `rootDir`）
- 如果没有，试默认 `localhost:21221`
- `onote status` 检查是否在线

**输出哲学**：默认人类可读（表格/文本），`--json` 给机器读。这是 Unix 哲学——CLI 的每个输出都可以 pipe。

### 3.3 MCP Server（Agent 用）

**ONote 既是 MCP Server 的宿主，也提供独立 MCP Server binary。**

#### 方案：嵌入式 Streamable HTTP

ONote 已在 `localhost:21221` 跑 Express。在此之上挂载 MCP endpoint：

```
POST /api/mcp          # MCP Streamable HTTP endpoint
```

用 `@modelcontextprotocol/server` + `@modelcontextprotocol/express` 中间件。

#### MCP Tools 定义

```typescript
// packages/electron/src/server/mcp/index.ts
import { McpServer } from '@modelcontextprotocol/server';

const server = new McpServer({ name: 'onote', version: '0.14.0' });

server.tool('list_notes', '列出笔记目录', { path: z.string().optional() },
  async ({ path }) => {
    const nodes = await dataSource.listDir(path || dataSource.getRootDirUri());
    return { content: [{ type: 'text', text: JSON.stringify(nodes) }] };
  }
);

server.tool('read_note', '读取笔记内容', { path: z.string() },
  async ({ path }) => {
    const content = await dataSource.readText(path);
    return { content: [{ type: 'text', text: content }] };
  }
);

server.tool('write_note', '创建或更新笔记', {
  path: z.string(),
  content: z.string(),
}, async ({ path, content }) => {
  await dataSource.writeText(path, content);
  return { content: [{ type: 'text', text: 'OK' }] };
});

server.tool('append_note', '追加内容到笔记', {
  path: z.string(),
  content: z.string(),
}, async ({ path, content }) => {
  const existing = await dataSource.readText(path);
  await dataSource.writeText(path, existing + '\n' + content);
  return { content: [{ type: 'text', text: 'OK' }] };
});

server.tool('delete_note', '删除笔记', { path: z.string() },
  async ({ path }) => {
    await dataSource.delete(path);
    return { content: [{ type: 'text', text: 'OK' }] };
  }
);

server.tool('search_notes', '搜索笔记', { query: z.string() },
  async ({ query }) => {
    const results = await dataSource.search(dataSource.getRootDirUri(), query);
    return { content: [{ type: 'text', text: JSON.stringify(results) }] };
  }
);

server.tool('rename_note', '重命名笔记', {
  path: z.string(),
  newName: z.string(),
}, async ({ path, newName }) => {
  const result = await dataSource.rename(path, newName);
  return { content: [{ type: 'text', text: JSON.stringify(result) }] };
});

server.tool('move_note', '移动笔记到新目录', {
  path: z.string(),
  targetDir: z.string(),
}, async ({ path, targetDir }) => {
  const result = await dataSource.move(path, targetDir);
  return { content: [{ type: 'text', text: JSON.stringify(result) }] };
});

// MCP Resources — 把笔记树作为资源暴露
server.resource('notes://root', async (uri) => ({
  contents: [{ uri: uri.href, text: '...' /* 树形结构 */ }]
}));
```

#### Agent 配置方式

**Claude Desktop / Cursor / VS Code Copilot** 等支持 MCP 的 Agent 只需配置：

```json
{
  "mcpServers": {
    "onote": {
      "url": "http://localhost:21221/api/mcp"
    }
  }
}
```

**对于 stdio 模式**（某些 Agent 只支持 stdio），提供一个独立 binary：

```bash
# packages/cli/src/mcp-stdio.ts
# 直接用 @modelcontextprotocol/server 的 StdioServerTransport
# 不需要 ONote GUI running，直接读本地文件系统
```

但这个是 Phase 2。Phase 1 只做 Streamable HTTP。

---

## 4. 文件结构变更

```
packages/
  electron/src/server/
    app.ts                    # 修改：挂载 /api/v1 和 /api/mcp
    api/
      index.ts                # REST API 路由
      middleware.ts            # 认证中间件
    mcp/
      index.ts                # MCP Server 定义
  cli/                        # 新 package
    src/
      index.ts                # CLI 入口
      client.ts               # HTTP client
      commands/
        ls.ts
        cat.ts
        write.ts
        rm.ts
        mv.ts
        append.ts
        search.ts
        mkdir.ts
        status.ts
        open.ts               # 启动 GUI
    package.json              # bin: { "onote": "./dist/index.js" }
    tsconfig.json
```

---

## 5. 实现路径

### Phase 1：REST API（1-2 天）

> **目标**：让 `curl` 能操作笔记。

- [ ] `packages/electron/src/server/api/` — 6 个端点
- [ ] 认证中间件（复用 WebDAV 的 Basic Auth）
- [ ] 统一错误格式
- [ ] 手动 curl 测试通过

**依赖**：零新依赖。只用已有的 Express + dataSource。

### Phase 2：CLI（2-3 天）

> **目标**：`onote ls`、`onote cat daily.md`、`onote write note.md`。

- [ ] `packages/cli/` 新建包
- [ ] HTTP client（`node-fetch` 或 undici）
- [ ] 命令解析（`commander` 或轻量手写）
- [ ] 10 个命令
- [ ] 人类可读输出 + `--json` 模式
- [ ] `onote status` 连接检测
- [ ] `yarn build` 后 `npm link` 到全局

**新增依赖**：`commander`（~30KB gzip，成熟稳定）

### Phase 3：MCP Server（2-3 天）

> **目标**：Agent 通过 MCP 协议操作 ONote。

- [ ] `@modelcontextprotocol/server` + `@modelcontextprotocol/express`
- [ ] 8 个 tools + notes:// 资源
- [ ] Streamable HTTP 挂载到 `/api/mcp`
- [ ] 测试：用 Claude Desktop 连接验证

**新增依赖**：`@modelcontextprotocol/server` + `@modelcontextprotocol/express`

---

## 6. 为什么不直接走 WebDAV

你已经有 WebDAV 了，为什么不直接用？

| 维度 | WebDAV | REST API + MCP |
|------|--------|---------------|
| 认证 | 每次都传 Basic Auth | CLI 自动处理，MCP 内部调用免认证 |
| 列目录 | PROPFIND 返回 XML | `GET /api/v1/notes` 返回 JSON |
| 搜索 | 不支持 | `GET /api/v1/search?q=xxx` |
| 重命名/移动 | 通用但笨重 | 语义化端点 |
| Agent 友好 | 需要 XML 解析 | MCP 原生 JSON-RPC |
| CLI 友好 | curl 要拼一堆参数 | `onote ls` 完事 |

WebDAV 保留给第三方 WebDAV 客户端（Finder、Raidrive 等）。REST API + MCP 是给人智慧和机器智能用的快捷通道。

---

## 7. 关键实现细节

### 7.1 认证策略

```
┌────────────────────────────────────────┐
│              Express 中间件链            │
│                                        │
│  /api/v1/*  →  apiAuth middleware      │
│  /api/mcp   →  mcpAuth middleware      │
│  /*         →  webdav auth (existing)  │
└────────────────────────────────────────┘
```

- `apiAuth`：HTTP Basic Auth，复用 WebDAV 用户名密码
- `mcpAuth`：代理内网调用可免认证（通过 `Mcp-Session-Id` 或白名单 IP）
- CLI 自动从 `~/.onote/credentials` 读取存储的认证信息

### 7.2 路径解析

CLI 用**相对路径**，API 用 **file:// URI**。转换在 `client.ts` 完成：

```typescript
// CLI 用户输入: onote cat daily.md
// client.ts 转换: GET /api/v1/notes/{rootDir}/daily.md
// API handler: jsonResponse(dataSource.readText("file:///Users/.../daily.md"))
```

### 7.3 无需 GUI 运行的场景

Phase 1-3 都需要 ONote GUI running（因为 Express 在 Electron 主进程里）。

**Phase 4（可选）**：独立的 MCP stdio server，直接读文件系统，不需要 GUI。这可以让 Agent 在 ONote 没打开的情况下也能操作笔记。但这是锦上添花，不是核心需求。

---

## 8. 总结

```
           ┌──────────┐
           │  人类    │  onote ls / cat / write
           └────┬─────┘
                │
    ┌───────────┼───────────┐
    ▼           ▼           ▼
┌────────┐ ┌────────┐ ┌────────┐
│  CLI   │ │  MCP   │ │ WebDAV │
└───┬────┘ └───┬────┘ └───┬────┘
    │          │          │
    ▼          ▼          ▼
┌─────────────────────────────────┐
│        REST API Layer            │
│        /api/v1/*  /api/mcp      │
├─────────────────────────────────┤
│        DataSource               │
│   (read/write/search/move/...)  │
├─────────────────────────────────┤
│     Electron + Express          │
│     localhost:21221             │
└─────────────────────────────────┘
```

**一句话**：CLI 人类用，MCP Agent 用，底层同一个 DataSource。三层夹一个核心。

做三件事：
1. **给 DataSource 加 HTTP 薄壳**（REST API）
2. **给 HTTP 薄壳加人类界面**（CLI）
3. **给 HTTP 薄壳加 Agent 界面**（MCP）

之后砍掉 `.claude/skills/onote/SKILL.md`——那个 curl 杂耍可以退休了。
