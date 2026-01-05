# LLMBox 架构说明

## 目录

- [概述](#概述)
- [系统架构图](#系统架构图)
- [核心组件](#核心组件)
- [交互流程](#交互流程)
- [数据流](#数据流)
- [状态管理](#状态管理)
- [安全设计](#安全设计)

## 概述

LLMBox 是 ONote 应用中的 AI 对话功能模块，为用户提供智能的笔记辅助服务。它通过 iframe 方式嵌入主窗口，实现了进程隔离的安全架构，并基于 OpenAI 兼容 API 提供流式对话体验。

### 主要特性

- 🤖 **智能对话**: 基于 LLM 的智能对话，理解笔记上下文
- 📝 **内容感知**: 自动获取笔记全文和选中内容作为上下文
- ⚡ **流式响应**: 实时显示 AI 回复，提升用户体验
- 🖼️ **多模态支持**: 支持文本和图片输入
- 🔒 **安全隔离**: 独立 iframe 运行，遵循 Electron 安全最佳实践

## 系统架构图

### 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        主进程 (Main Process)                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Setting Handler                                        │  │
│  │  - chatgpt.api-key                                      │  │
│  │  - chatgpt.base-url                                     │  │
│  │  - chatgpt.model-name                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↓                                    │
│                  注入设置到渲染进程                               │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                   主窗口 (Main Window)                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Monaco Editor                                          │  │
│  │  - 获取笔记内容 (note)                                   │  │
│  │  - 获取选中内容 (selection)                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↓                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  EventBus                                               │  │
│  │  - EDITOR_CONTENT_CHANGED                               │  │
│  │  - EDITOR_SELECTION_CHANGED                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↓                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  LLMBoxFrame Component                                  │  │
│  │  - 创建 iframe 通信信道                                  │  │
│  │  - 传递编辑器内容                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                ↓ iframe
┌─────────────────────────────────────────────────────────────────┐
│                  LLMBox (独立 React 应用)                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  LLMChatStore (MobX)                                    │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │ 状态管理                                          │  │  │
│  │  │ - messages[]                                       │  │  │
│  │  │ - isLoading                                        │  │  │
│  │  │ - error                                            │  │  │
│  │  │ - note, selection                                  │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                          ↓                               │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │ sendMessage()                                    │  │  │
│  │  │ 1. validateRequest()                             │  │  │
│  │  │ 2. buildRequestMessages()                         │  │  │
│  │  │ 3. callLLMAPI()                                   │  │  │
│  │  │ 4. processStreamResponse()                        │  │  │
│  │  │ 5. parseSSELine()                                 │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↓                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  UI Components                                           │  │
│  │  - MessageList: 显示对话历史                          │  │
│  │  - ChatArea: 聊天区域，支持自动滚动                     │  │
│  │  - InputArea: 输入区域，支持文本和图片                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                ↓ HTTP/SSE
┌─────────────────────────────────────────────────────────────────┐
│                    LLM API (OpenAI/兼容)                        │
│  - POST /v1/chat/completions                                  │
│  - stream: true                                               │
│  - Server-Sent Events (SSE)                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 核心组件

### 1. LLMBoxFrame 组件

**位置**: `packages/renderer/src/main/containers/LLMBox/LLMBoxFrame.tsx`

**职责**:
- 创建和管理 LLMBox 的 iframe
- 建立主窗口与 LLMBox 之间的双向通信
- 同步编辑器内容到 LLMBox

**关键代码**:
```typescript
// 创建通信信道
const channel = createChannel<{ type: string; data: unknown }>(iframeRef, 'llmbox');

// 监听编辑器内容变化
useEffect(() => {
  const handleContentChanged = ({ content, selection }) => {
    channel.send({ type: EDITOR_CONTENT_CHANGED, data: { content, selection } });
  };

  eventbus.on(EDITOR_CONTENT_CHANGED, handleContentChanged);
  // ...
}, []);
```

### 2. LLMChatStore (MobX Store)

**位置**: `packages/renderer/src/llmbox/LLMChatStore.ts`

**职责**:
- 管理对话状态（消息列表、加载状态、错误）
- 处理 LLM API 调用
- 处理流式响应
- 管理编辑器内容同步

**状态结构**:
```typescript
interface ChatState {
  messages: Message[];           // 对话历史
  isLoading: boolean;            // 加载状态
  error: string | null;          // 错误信息
  streamingMessageId?: string;   // 当前流式消息 ID
  note?: string;                 // 笔记全文
  selection?: string;            // 选中的内容
}
```

**主要方法**:
```typescript
// 消息管理
addMessage(message): string
updateStreamingMessage(messageId, content): void
completeStreamingMessage(messageId): void

// 内容同步
updateEditorContent(content, selection): void

// API 调用
sendMessage(content, imageUrls?): Promise<void>
```

### 3. UI 组件

#### MessageList
- 渲染对话历史
- 支持用户消息和助手消息的不同样式
- 处理流式消息的实时更新

#### ChatArea
- 消息显示容器
- 自动滚动到最新消息
- 支持手动滚动时暂停自动滚动

#### InputArea
- 文本输入框
- 图片上传（支持粘贴、拖拽、文件选择）
- 发送按钮

## 交互流程

### 1. 初始化流程

```
1. 主窗口启动
   ↓
2. 加载设置 (主进程注入 window.__settings)
   ↓
3. 创建 LLMBoxFrame 组件
   ↓
4. 加载 llmbox.html (iframe)
   ↓
5. 初始化 LLMChatStore (从 window.__settings 读取 API 配置)
   ↓
6. 建立通信信道
   ↓
7. 监听编辑器内容变化
```

### 2. 发送消息流程

```
用户输入消息
   ↓
点击发送按钮
   ↓
validateRequest() - 验证 API Key
   ↓
addMessage() - 添加用户消息到列表
   ↓
buildRequestMessages() - 构建请求消息
   ├─ buildSystemMessage(note, selection)
   ├─ 历史消息
   └─ 当前用户消息
   ↓
callLLMAPI() - 发送 HTTP POST 请求
   ↓
processStreamResponse() - 处理流式响应
   ├─ 读取 SSE 流
   ├─ parseSSELine() - 解析每一行数据
   ├─ updateStreamingMessage() - 更新 UI
   └─ 重复直到响应完成
   ↓
completeStreamingMessage() - 完成消息
   ↓
更新 UI 状态 (isLoading = false)
```

### 3. 内容同步流程

```
用户在 Monaco Editor 中编辑内容
   ↓
Monaco 触发 onDidChangeModelContent 事件
   ↓
EventBus 发送 EDITOR_CONTENT_CHANGED 事件
   ↓
LLMBoxFrame 监听到事件
   ↓
通过 channel.send() 发送到 iframe
   ↓
LLMBox 接收消息
   ↓
LLMChatStore.updateEditorContent()
   ↓
更新 note 和 selection 状态
```

### 4. 接收 AI 响应流程

```
LLM API 返回流式响应 (SSE)
   ↓
processStreamResponse() 读取流
   ↓
解析 SSE 数据行
   │  "data: {"choices":[{"delta":{"content":"Hello"}}]}"
   ↓
提取 content 字段
   ↓
updateStreamingMessage() 追加到消息内容
   ↓
MobX 触发 UI 更新
   ↓
MessageItem 实时显示流式内容
   ↓
ChatArea 自动滚动到底部
```

## 数据流

### 数据流向图

```
┌─────────────┐
│ Main Process│
│  (Setting)  │
└──────┬──────┘
       │ 注入设置
       ↓
┌─────────────┐     编辑器变化      ┌──────────────┐
│  Main Window│◄───────────────────┤ Monaco Editor│
│  (React)    │  EventBus           │              │
└──────┬──────┘                     └──────────────┘
       │ iframe + postMessage
       ↓
┌─────────────┐
│   LLMBox    │
│ (iframe)    │
└──────┬──────┘
       │ MobX State
       ↓
┌─────────────────────────────┐
│     LLMChatStore           │
│  ┌─────────────────────┐   │
│  │ messages[]          │   │
│  │ note, selection     │◄──┘ (从主窗口同步)
│  │ isLoading, error     │
│  └─────────────────────┘
└───────────┬─────────────────┘
            │ HTTP Request
            ↓
┌─────────────────────────────┐
│      LLM API                │
│  OpenAI / Compatible        │
└───────────┬─────────────────┘
            │ SSE Stream
            ↓
┌─────────────────────────────┐
│   parseSSELine()            │
│   updateStreamingMessage()  │
└─────────────────────────────┘
```

### 消息数据结构

```typescript
// 用户消息
{
  id: "message-123456",
  content: "请总结这段话",
  role: "user",
  timestamp: 2026-01-05T10:00:00.000Z,
  imageUrls?: ["data:image/png;base64,..."]  // 可选
}

// 助手消息（流式）
{
  id: "message-789012",
  content: "这段话的主要观点是...",  // 逐步追加
  role: "assistant",
  timestamp: 2026-01-05T10:00:01.000Z,
  isStreaming: true  // 流式状态
}
```

## 状态管理

### MobX Store 架构

```typescript
class LLMChatStore implements ChatState {
  // ========== 状态 ==========
  messages: Message[] = [];
  isLoading = false;
  error: string | null = null;
  streamingMessageId?: string;
  note?: string;
  selection?: string;

  // ========== 方法 ==========

  // 消息管理
  addMessage(message): string {
    const newMessage: Message = {
      ...message,
      id: uuid('message-'),
    };
    runInAction(() => {
      this.messages = [...this.messages, newMessage];
    });
    return newMessage.id;
  }

  updateStreamingMessage(messageId: string, content: string) {
    runInAction(() => {
      this.messages = this.messages.map((msg) =>
        msg.id === messageId
          ? { ...msg, content: msg.content + content, isStreaming: true }
          : msg,
      );
    });
  }

  // 内容同步
  updateEditorContent(content: string, selection: string) {
    runInAction(() => {
      this.note = content;
      this.selection = selection;
    });
  }

  // API 调用
  sendMessage = async (content: string, imageUrls?: string[]) => {
    // 1. 验证请求
    this.validateRequest();

    // 2. 创建用户消息
    this.addMessage({ content, role: 'user', timestamp: new Date(), imageUrls });

    // 3. 创建助手消息占位符
    const assistantMessageId = this.addMessage({
      content: '',
      role: 'assistant',
      timestamp: new Date(),
      isStreaming: true,
    });

    // 4. 构建并发送请求
    const messages = this.buildRequestMessages(content, assistantMessageId);
    const response = await this.callLLMAPI(messages);

    // 5. 处理流式响应
    await this.processStreamResponse(response, assistantMessageId);

    // 6. 完成消息
    this.completeStreamingMessage(assistantMessageId);
  }
}
```

### 响应式更新流程

```
User Action (发送消息)
   ↓
调用 sendMessage()
   ↓
runInAction(() => { this.isLoading = true })
   ↓
MobX 自动通知观察者
   ↓
UI 组件 (observer) 重新渲染
   ├─ InputArea: 禁用输入框
   ├─ MessageList: 显示加载指示
   └─ ChatArea: 显示加载状态
   ↓
收到流式响应
   ↓
updateStreamingMessage(id, content)
   ↓
MobX 触发更新
   ↓
MessageItem 实时显示新内容
   ↓
ChatArea 自动滚动
```

## 安全设计

### 1. 进程隔离

```
┌─────────────────────────────┐
│   Main Window Process       │
│   ┌─────────────────────┐   │
│   │ Monaco Editor        │   │
│   │ 其他 UI 组件         │   │
│   └─────────────────────┘   │
│                             │
│   ┌─────────────────────┐   │
│   │  <iframe>           │   │
│   │  └─────────────────┐ │   │
│   │   │ LLMBox App    │ │   │
│   │   │ (隔离环境)     │ │   │
│   │   └─────────────────┘ │   │
│   └─────────────────────┘   │
└─────────────────────────────┘
```

**隔离优势**:
- LLMBox 崩溃不影响主窗口
- 限制 DOM 污染范围
- 控制脚本执行上下文

### 2. Content Security Policy

```typescript
// llmbox.html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self' 'unsafe-inline' 'unsafe-eval';
               style-src 'self' 'unsafe-inline';
               img-src 'self' data: blob:;
               connect-src 'self' https://api.openai.com;">
```

### 3. 设置注入机制

```typescript
// 主进程控制设置访问，避免直接暴露敏感信息
const settings = setting.getAll();

// 在窗口创建时注入
frame.executeJavaScript(
  `window.__settings = ${JSON.stringify(settings)}`
);

// LLMBox 读取设置
const apiKey = window.__settings?.[LLM_API_KEY];
```

### 4. 无 Node.js 访问

LLMBox 运行在渲染进程的 iframe 中：
- ❌ 不能直接访问 `require()`
- ❌ 不能直接访问 `fs`, `path` 等 Node.js 模块
- ✅ 只能通过预加载脚本暴露的 API 访问主进程服务

## API 交互详情

### 请求格式

```http
POST https://api.openai.com/v1/chat/completions HTTP/1.1
Content-Type: application/json
Authorization: Bearer sk-...

{
  "model": "gpt-3.5-turbo",
  "messages": [
    {
      "role": "system",
      "content": "请担任专业的笔记助手，基于用户提供的笔记上下文..."
    },
    {
      "role": "user",
      "content": "之前的对话历史..."
    },
    {
      "role": "user",
      "content": "当前用户输入"
    }
  ],
  "stream": true
}
```

### SSE 响应格式

```
data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1704451200,"model":"gpt-3.5-turbo",choices":[{"index":0,"delta":{"content":"Hello"}}],"finish_reason":null}

data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1704451201,"model":"gpt-3.5-turbo","choices":[{"index":0,"delta":{"content":" there"}}],"finish_reason":null}

data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1704451202,"model":"gpt-3.5-turbo","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}

data: [DONE]
```

### 解析逻辑

```typescript
private parseSSELine(line: string): string | null {
  // 1. 过滤空行和结束标记
  if (line.trim() === '' || line.trim() === 'data: [DONE]') {
    return null;
  }

  // 2. 验证数据前缀
  if (!line.startsWith('data: ')) {
    return null;
  }

  // 3. 解析 JSON
  try {
    const jsonData = line.slice(6); // 移除 'data: ' 前缀
    const data = JSON.parse(jsonData);
    return data.choices[0]?.delta?.content || null;
  } catch (e) {
    logger.warn('Failed to parse SSE data', e, { line });
    return null;
  }
}
```

## 性能优化

### 1. 流式响应优化

- **实时更新**: 收到一块数据就立即更新 UI，不等待完整响应
- **缓冲处理**: 使用 TextDecoder 和缓冲区处理不完整的数据行
- **资源释放**: 使用 `reader.releaseLock()` 确保流正确关闭

### 2. 内存管理

```typescript
// 使用 MobX 的 runInAction 批量更新状态
runInAction(() => {
  this.messages = [...this.messages, newMessage];
});

// 流式消息直接追加内容，不创建新对象
this.messages = this.messages.map((msg) =>
  msg.id === messageId
    ? { ...msg, content: msg.content + content }  // ❌ 不好：每次都创建新字符串
    : msg,
);

// 优化：使用数组存储内容块，最后合并
```

### 3. UI 渲染优化

- **虚拟滚动**: MessageList 可以考虑使用虚拟滚动（未实现）
- **防抖**: 自动滚动功能添加防抖（已实现）
- **懒加载**: 图片消息使用懒加载（未实现）

## 扩展性设计

### 1. 支持多种 LLM 提供商

```typescript
interface LLMProvider {
  name: string;
  buildRequest(messages, options): Request;
  parseSSE(line): string | null;
}

class OpenAIProvider implements LLMProvider { ... }
class AnthropicProvider implements LLMProvider { ... }
class GeminiProvider implements LLMProvider { ... }
```

### 2. 插件化提示词

```typescript
interface PromptTemplate {
  name: string;
  template: (note: string, selection: string) => string;
}

const templates: PromptTemplate[] = [
  {
    name: 'summary',
    template: (note, selection) => `请总结：${selection}`
  },
  {
    name: 'translate',
    template: (note, selection) => `请翻译：${selection}`
  }
];
```

### 3. 多模态扩展

当前支持：
- ✅ 文本输入
- ✅ 图片输入（base64）

未来可扩展：
- 📄 文档上传（PDF、Word）
- 🎤 语音输入
- 📹 视频分析

## 故障排查

### 常见问题

#### 1. API Key 未配置

**错误信息**: `API密钥未配置`

**解决方案**:
1. 打开设置面板
2. 找到 "ChatGPT 配置"
3. 填写 API Key
4. 保存设置

#### 2. 流式响应中断

**错误信息**: `Failed to parse SSE data`

**可能原因**:
- 网络不稳定
- API 服务异常
- 数据格式变更

**解决方案**:
1. 检查网络连接
2. 查看 Console 日志
3. 重试发送消息

#### 3. iframe 通信失败

**错误信息**: `Failed to send message to LLMBox`

**可能原因**:
- iframe 未加载完成
- 跨域限制
- CSP 策略过于严格

**解决方案**:
1. 确保使用 `createChannel` 建立通信
2. 检查 CSP 设置
3. 查看 Console 错误信息

## 相关文件

### 核心文件

```
packages/renderer/src/llmbox/
├── index.ts                    # 导出入口
├── types.ts                    # 类型定义
├── LLMBox.tsx                  # 主容器组件
├── LLMChatStore.ts            # MobX Store（状态管理）
├── ChatArea.tsx                # 聊天区域
├── InputArea.tsx               # 输入区域
├── MessageList.tsx             # 消息列表
├── MessageItem.tsx             # 消息项
└── LLMBox.module.scss          # 样式文件

packages/renderer/src/main/containers/LLMBox/
└── LLMBoxFrame.tsx             # iframe 容器组件

packages/renderer/src/entry/
├── llmbox.tsx                  # LLMBox 入口
└── llmbox.html                 # LLMBox HTML 模板
```

### 配置文件

```typescript
packages/electron/src/setting/
└── key.ts                       # 设置键定义
  export const LLM_API_KEY = 'chatgpt.api-key';
  export const LLM_BASE_URL = 'chatgpt.base-url';
  export const LLM_MODEL_NAME = 'chatgpt.model-name';
```

## 总结

LLMBox 模块通过以下设计实现了功能丰富且安全可靠的 AI 对话功能：

1. **架构清晰**: iframe 隔离 + MobX 状态管理 + 流式 API
2. **交互友好**: 实时流式响应 + 自动滚动 + 图片支持
3. **安全可靠**: 进程隔离 + CSP 限制 + 设置注入机制
4. **易于维护**: 单一职责 + 清晰的数据流 + 完善的错误处理

这个架构为 ONote 应用提供了强大的 AI 能力，同时保持了良好的用户体验和系统安全性。
