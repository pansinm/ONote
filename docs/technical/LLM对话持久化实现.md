# LLM 对话持久化实现

本文档详细说明 ONote 中 LLM（大语言模型）对话持久化功能的实现原理和使用方法。

## 概述

LLM 对话持久化功能允许用户在不同文件之间切换时，保存和恢复各自的 AI 对话历史。每个文件的对话历史会自动保存到 `.onote/data/{hash}/ai/conversation.json`，切换文件时自动加载对应的历史对话。

## 架构设计

### 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                     主进程 (Main Process)                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │        LLMConversationHandler (IPC Handler)          │  │
│  │  - loadConversation(params): Message[] | null         │  │
│  │  - saveConversation(params): Promise<void>            │  │
│  │  - deleteConversation(params): Promise<void>         │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │ IPC (Electron)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                 渲染进程 - 主窗口 (Main Window)              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              LLMBoxFrame (父窗口)                    │  │
│  │  - 管理 iframe 和 bidc channel                      │  │
│  │  - 响应文件切换事件                                  │  │
│  │  - 转发 IPC 调用                                      │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │ bidc (iframe 通信)                   │
│                     ▼                                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              llmbox.html (子窗口 iframe)              │  │
│  │  - LLMChatStore (MobX 状态管理)                      │  │
│  │  - LLMBox UI 组件                                    │  │
│  │  - 对话持久化逻辑                                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 文件结构

### 主进程文件

```
packages/electron/src/
├── ipc-server/
│   ├── handlers/
│   │   └── LLMConversationHandler.ts    # 对话持久化处理器
│   ├── IpcHandler.ts                      # IPC Handler 基类
│   ├── IPCServer.ts                       # IPC 服务器
│   └── index.ts                           # IPC 注册
├── constants/
│   └── index.ts                           # IPC 命名空间定义
└── preload/
    └── main/
        └── onote.ts                      # 暴露 onote API
```

### 渲染进程文件

```
packages/renderer/src/
├── main/
│   └── containers/
│       └── LLMBox/
│           ├── LLMBoxFrame.tsx            # iframe 容器组件
│           └── constants.ts               # 消息类型定义
├── llmbox/
│   ├── LLMChatStore.ts                    # MobX Store
│   ├── LLMBox.tsx                        # UI 组件
│   ├── MessageItem.tsx                    # 消息项组件
│   └── types.ts                          # 类型定义
└── entry/
    └── llmbox.tsx                        # 子窗口入口
```

## 核心实现

### 1. 主进程 Handler (LLMConversationHandler.ts)

```typescript
import path from 'node:path';
import fs from 'fs/promises';
import crypto from 'node:crypto';
import { uriToPath } from '/@/dataSource/providers/ssh/uri';
import IpcHandler from '../IpcHandler';
import { getLogger } from '/@/shared/logger';
import type { Message } from '/@/renderer/src/llmbox/types';

const logger = getLogger('LLMConversationHandler');

interface LoadConversationParams {
  fileUri: string;
  rootUri: string;
}

interface SaveConversationParams {
  fileUri: string;
  messages: Message[];
  rootUri: string;
}

class LLMConversationHandler extends IpcHandler {
  private getBaseDir(rootUri: string): string {
    const rootPath = uriToPath(rootUri);
    return path.join(rootPath, '.onote', 'data');
  }

  private getFilePath(fileUri: string, rootUri: string): string {
    const filePath = uriToPath(fileUri);
    const relativePath = path.relative(uriToPath(rootUri), filePath);
    const hash = crypto.createHash('md5').update(relativePath).digest('hex');
    const baseDir = this.getBaseDir(rootUri);
    return path.join(baseDir, hash, 'ai', 'conversation.json');
  }

  async loadConversation(params: LoadConversationParams): Promise<Message[] | null> {
    const { fileUri, rootUri } = params;
    try {
      const filePath = this.getFilePath(fileUri, rootUri);
      const content = await fs.readFile(filePath, 'utf-8');
      const messages = JSON.parse(content) as Message[];
      logger.info('Conversation loaded successfully', {
        fileUri,
        rootUri,
        messageCount: messages.length,
      });
      return messages;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        logger.debug('Conversation file not found', { fileUri, rootUri });
        return null; // 文件不存在时返回 null
      }
      logger.error('Failed to load conversation', error, { fileUri, rootUri });
      throw error;
    }
  }

  async saveConversation(params: SaveConversationParams): Promise<void> {
    const { fileUri, messages, rootUri } = params;
    try {
      const filePath = this.getFilePath(fileUri, rootUri);
      const dir = path.dirname(filePath);

      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(filePath, JSON.stringify(messages, null, 2), 'utf-8');

      logger.info('Conversation saved successfully', {
        fileUri,
        rootUri,
        messageCount: messages.length,
      });
    } catch (error) {
      logger.error('Failed to save conversation', error, { fileUri, rootUri });
      throw error;
    }
  }

  async deleteConversation(params: { fileUri: string; rootUri: string }): Promise<void> {
    const { fileUri, rootUri } = params;
    try {
      const filePath = this.getFilePath(fileUri, rootUri);
      await fs.unlink(filePath);
      logger.info('Conversation deleted successfully', { fileUri, rootUri });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return; // 文件不存在时忽略错误
      }
      logger.error('Failed to delete conversation', error, { fileUri, rootUri });
      throw error;
    }
  }
}

export default LLMConversationHandler;
```

### 2. IPC 注册 (packages/electron/src/ipc-server/index.ts)

```typescript
import LLMConversationHandler from './handlers/LLMConversationHandler';
import { IPCNamespaces } from '../constants';

export function startIpcServer() {
  ipcServer.register(IPCNamespaces.LLMConversation, LLMConversationHandler);
}
```

### 3. Preload API 暴露 (packages/electron/src/preload/main/onote.ts)

```typescript
import IPCClient from '../ipc/IPCClient';
import type LLMConversationHandler from '../../ipc-server/handlers/LLMConversationHandler';

export const onote = {
  llmConversation: new IPCClient<LLMConversationHandler>(IPCNamespaces.LLMConversation),
};

exposeInMainWorld('onote', onote);
```

### 4. IPCClient 实现 (packages/electron/src/preload/ipc/IPCClient.ts)

```typescript
import { ipcRenderer } from 'electron';

type PickMethods<T> = {
  [key in keyof T]: T[key] extends (...args: any) => any ? T[key] : never;
};

class IPCClient<T> {
  constructor(private namespace: string) {}

  invoke = async <TM extends PickMethods<T>, TP extends keyof TM>(
    method: TP,
    ...args: Parameters<TM[TP]>
  ): Promise<Awaited<ReturnType<TM[TP]>>> => {
    return await ipcRenderer.invoke(
      `${this.namespace}.${method as string}`,
      ...(args as any),
    );
  };
}

export default IPCClient;
```

### 5. 父窗口容器 (packages/renderer/src/main/containers/LLMBox/LLMBoxFrame.tsx)

```typescript
import React, { useEffect, useRef } from 'react';
import { createChannel } from 'bidc';
import stores from '../../stores';
import { reaction } from 'mobx';
import { LLM_BOX_MESSAGE_TYPES } from './constants';

function LLMBoxFrame() {
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!ref.current?.contentWindow) return;

    const { send, receive } = createChannel(
      ref.current!.contentWindow!,
      'MAIN_FRAME-LLM_BOX',
    );

    // 监听文件切换事件
    const activeFileDisposer = reaction(
      () => stores.activationStore.activeFileUri,
      (uri) => {
        if (uri) {
          send({
            type: LLM_BOX_MESSAGE_TYPES.EDITOR_FILE_OPEN,
            data: { uri },
          });
        }
      },
    );

    // 处理子窗口的消息
    receive(async ({ type, data }: any) => {
      // 获取当前文件信息
      if (type === LLM_BOX_MESSAGE_TYPES.GET_CURRENT_FILE_INFO) {
        return {
          fileUri: stores.activationStore.activeFileUri,
          rootUri: stores.activationStore.rootUri,
        };
      }

      // 加载对话历史
      if (type === LLM_BOX_MESSAGE_TYPES.LLM_CONVERSATION_LOAD) {
        const { fileUri } = data;
        const rootUri = stores.activationStore.rootUri;

        try {
          const onote = (window as any).onote;
          const messages = await onote.llmConversation.invoke('loadConversation', {
            fileUri,
            rootUri,
          });
          return { messages };
        } catch (error) {
          return {
            error: error instanceof Error ? error.message : '加载对话历史失败',
          };
        }
      }

      // 保存对话历史
      if (type === LLM_BOX_MESSAGE_TYPES.LLM_CONVERSATION_SAVE) {
        const { fileUri, messages } = data;
        const rootUri = stores.activationStore.rootUri;

        try {
          const onote = (window as any).onote;
          await onote.llmConversation.invoke('saveConversation', {
            fileUri,
            messages,
            rootUri,
          });
          return { success: true };
        } catch (error) {
          return {
            error: error instanceof Error ? error.message : '保存对话历史失败',
          };
        }
      }
    });

    return () => {
      activeFileDisposer();
    };
  }, []);

  return (
    <iframe
      ref={ref}
      title="LLMBox"
      style={{ position: 'absolute', bottom: 0, right: 0, height: '100%', width: '100%' }}
      src={stores.layoutStore.sidebarUrl}
    />
  );
}

export default LLMBoxFrame;
```

### 6. 子窗口入口 (packages/renderer/src/entry/llmbox.tsx)

```typescript
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { observer } from 'mobx-react-lite';

import { LLMBox } from '../llmbox';
import { LLMChatStore } from '../llmbox/LLMChatStore';
import { createChannel } from 'bidc';
import { LLM_BOX_MESSAGE_TYPES } from '../main/containers/LLMBox/constants';

const { send, receive } = createChannel('MAIN_FRAME-LLM_BOX');

const MyChatComponent: React.FC = observer(() => {
  const [store] = useState(() => new LLMChatStore({
    apiKey: settings[LLM_API_KEY],
    model: settings[LLM_MODEL_NAME],
    apiBase: `${settings[LLM_BASE_URL]}/chat/completions`,
  }));

  useEffect(() => {
    // 设置保存对话的处理器
    const saveConversationHandler = async (fileUri: string, messages: any[]) => {
      await send({
        type: LLM_BOX_MESSAGE_TYPES.LLM_CONVERSATION_SAVE,
        data: { fileUri, messages },
      });
    };
    store.setSaveConversation(saveConversationHandler);

    // 定义加载对话的函数
    const loadConversation = async (fileUri: string) => {
      const response = await send({
        type: LLM_BOX_MESSAGE_TYPES.LLM_CONVERSATION_LOAD,
        data: { fileUri },
      }) as { error?: string; messages?: any[] };

      if (!response.error) {
        store.setMessages(response.messages || []);
      }
    };

    // 监听父窗口的消息
    receive(async ({ type, data }: any) => {
      if (type === LLM_BOX_MESSAGE_TYPES.EDITOR_FILE_OPEN && data?.uri) {
        store.updateFileUri(data.uri);
        store.setLoadConversation(loadConversation);
        await loadConversation(data.uri); // 切换文件时加载对话
      }
    });

    // 初始化时获取当前文件信息
    const getCurrentFileInfo = async () => {
      const response = await send({
        type: LLM_BOX_MESSAGE_TYPES.GET_CURRENT_FILE_INFO,
      }) as { fileUri?: string; rootUri?: string };

      if (response.fileUri) {
        store.updateFileUri(response.fileUri);
        store.setLoadConversation(loadConversation);
        await loadConversation(response.fileUri);
      }
    };

    setTimeout(getCurrentFileInfo, 500);
  }, [store]);

  return (
    <div style={{ height: '100vh' }}>
      <LLMBox store={store} />
    </div>
  );
});

const root = createRoot(document.getElementById('app') as HTMLDivElement);
window.addEventListener('onote:ready', () => {
  root.render(<MyChatComponent />);
});
```

### 7. MobX Store (packages/renderer/src/llmbox/LLMChatStore.ts)

```typescript
import { makeAutoObservable } from 'mobx';
import type { Message } from './types';

class LLMChatStore {
  messages: Message[] = [];
  fileUri: string | null = null;
  saveConversation: ((fileUri: string, messages: Message[]) => Promise<void>) | null = null;
  loadConversation: ((fileUri: string) => Promise<void>) | null = null;

  constructor(config: { apiKey: string; model: string; apiBase: string }) {
    makeAutoObservable(this);
    this.apiKey = config.apiKey;
    this.model = config.model;
    this.apiBase = config.apiBase;
  }

  updateFileUri(uri: string) {
    this.fileUri = uri;
  }

  setMessages(messages: Message[]) {
    this.messages = messages.map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp), // 确保时间戳是 Date 对象
    }));
  }

  setSaveConversation(handler: (fileUri: string, messages: Message[]) => Promise<void>) {
    this.saveConversation = handler;
  }

  setLoadConversation(handler: (fileUri: string) => Promise<void>) {
    this.loadConversation = handler;
  }

  async completeStreamingMessage() {
    // 对话完成后自动保存
    if (this.fileUri && this.saveConversation) {
      await this.saveConversation(this.fileUri, this.messages);
    }
  }
}
```

## 数据存储格式

### 文件路径

对话历史存储在以下路径：

```
{rootUri}/.onote/data/{fileHash}/ai/conversation.json
```

其中：
- `rootUri`: 项目根目录的 URI（例如：`file:///Users/user/project`）
- `fileHash`: 文件相对路径的 MD5 哈希值（例如：`a1b2c3d4e5f6...`）

### 数据格式 (conversation.json)

```json
[
  {
    "id": "message-1-abc123",
    "content": "请解释一下这段代码的功能",
    "role": "user",
    "timestamp": "2026-01-06T12:00:00.000Z"
  },
  {
    "id": "message-2-def456",
    "content": "这段代码的功能是...",
    "role": "assistant",
    "timestamp": "2026-01-06T12:00:01.500Z"
  }
]
```

## 关键技术点

### 1. IPC 通信模式

使用 Electron 的 `ipcRenderer.invoke()` 和 `ipcMain.handle()` 进行异步通信：

```typescript
// 渲染进程
const messages = await onote.llmConversation.invoke('loadConversation', {
  fileUri,
  rootUri,
});

// 主进程（通过 IPCServer 自动注册）
ipcMain.handle('LLMConversation.loadConversation', async (event, params) => {
  const instance = new LLMConversationHandler(event.sender, 'LLMConversation');
  return await instance.loadConversation(params);
});
```

### 2. iframe 通信 (bidc)

使用 `bidc` 库实现父子窗口之间的通信：

```typescript
// 父窗口发送
send({
  type: 'EDITOR_FILE_OPEN',
  data: { uri: 'file:///path/to/file.md' },
});

// 子窗口接收
receive(({ type, data }) => {
  if (type === 'EDITOR_FILE_OPEN') {
    console.log('File opened:', data.uri);
  }
});
```

### 3. 文件路径处理

使用 `uriToPath` 将 URI 转换为文件系统路径：

```typescript
const filePath = uriToPath(fileUri); // file:///path/to/file.md -> /path/to/file.md
const relativePath = path.relative(rootPath, filePath); // 获取相对路径
const hash = crypto.createHash('md5').update(relativePath).digest('hex'); // MD5 哈希
```

### 4. MobX 状态管理

使用 MobX 管理对话状态，实现响应式更新：

```typescript
class LLMChatStore {
  messages: Message[] = [];

  constructor() {
    makeAutoObservable(this); // 自动追踪可观察属性
  }

  setMessages(messages: Message[]) {
    this.messages = messages; // 自动触发 UI 更新
  }
}
```

### 5. 文件切换监听

使用 MobX 的 `reaction` 监听文件切换事件：

```typescript
const activeFileDisposer = reaction(
  () => stores.activationStore.activeFileUri,
  (uri) => {
    if (uri) {
      send({
        type: LLM_BOX_MESSAGE_TYPES.EDITOR_FILE_OPEN,
        data: { uri },
      });
    }
  },
);
```

## 常见问题

### 1. 为什么需要 iframe？

使用 iframe 可以将 LLM 对话功能隔离在独立的窗口中，具有以下好处：

- **代码隔离**：LLM 相关代码与主应用代码分离，减少耦合
- **独立状态**：LLM 对话状态独立管理，不影响主应用性能
- **易于维护**：可以独立开发和测试 LLM 功能
- **灵活性**：未来可以方便地调整 LLM 窗口的位置和大小

### 2. 为什么使用 bidc 而不是 postMessage？

`bidc` (Bi-directional iframe Communication) 是一个专门为 iframe 通信设计的库，相比原生的 `postMessage` 有以下优势：

- **类型安全**：支持 TypeScript 类型定义
- **双向通信**：支持请求-响应模式，类似 IPC
- **自动序列化**：自动处理数据序列化和反序列化
- **错误处理**：内置错误处理机制

### 3. 如何调试对话持久化功能？

可以通过以下方式调试：

1. **查看日志**：在 Console 中查看 `[LLMBoxFrame]` 和 `[llmbox.tsx]` 开头的日志
2. **检查文件**：查看 `{rootUri}/.onote/data/{hash}/ai/conversation.json` 文件是否存在
3. **Network 面板**：在 DevTools 的 Network 面板中查看 IPC 请求
4. **断点调试**：在 `LLMConversationHandler.ts` 和 `LLMChatStore.ts` 中设置断点

### 4. 如何清空某个文件的对话历史？

可以通过以下方式清空：

```typescript
await onote.llmConversation.invoke('deleteConversation', {
  fileUri,
  rootUri,
});
```

或者在文件系统中直接删除 `{rootUri}/.onote/data/{hash}/ai/conversation.json` 文件。

### 5. 如何扩展对话持久化功能？

可以通过以下方式扩展：

1. **添加元数据**：在 `Message` 类型中添加 `tags`、`summary` 等字段
2. **支持搜索**：在 `LLMChatStore` 中添加搜索对话的功能
3. **导出功能**：添加导出对话为 Markdown 或 JSON 的功能
4. **云同步**：通过插件系统支持云存储

## 性能优化建议

1. **批量保存**：避免频繁保存，可以设置防抖或节流
2. **增量加载**：对于大量对话，可以分页加载历史消息
3. **缓存策略**：在内存中缓存已加载的对话，避免重复读取文件
4. **压缩存储**：对于长对话，可以使用压缩算法减少存储空间

## 安全注意事项

1. **路径验证**：确保 `fileUri` 和 `rootUri` 是合法的路径，防止路径遍历攻击
2. **权限控制**：确保只有有权限的文件才能访问对话历史
3. **数据加密**：对于敏感对话，可以考虑加密存储
4. **输入验证**：在保存和加载时验证数据格式，防止注入攻击

## 总结

LLM 对话持久化功能通过以下技术实现了跨文件的对话历史管理：

- **IPC 通信**：主进程和渲染进程之间的安全通信
- **bidc**：iframe 父子窗口之间的双向通信
- **MobX**：响应式状态管理
- **文件系统**：使用 JSON 格式持久化对话数据

该功能为用户提供了无缝的 AI 对话体验，切换文件时自动保存和恢复对话历史，提高了工作效率。
