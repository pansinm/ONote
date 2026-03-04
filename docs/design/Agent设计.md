# Agent 功能实现文档

## 概述

Agent 功能为 ONote 提供智能任务执行能力，基于 [Vercel AI SDK](https://sdk.vercel.ai/) 的 `ToolLoopAgent` 实现，通过 LLM 和工具系统实现自动化的文件操作、代码修改、文档生成等复杂任务。Agent 运行在独立的 iframe 中，通过 bidc 与主窗口通信，支持流式响应和实时状态更新。

## 技术选型

### 核心依赖
- **Vercel AI SDK** - 提供 `ToolLoopAgent` 和流式响应能力
- **Zod** - 工具参数 Schema 定义
- **MobX** - 状态管理
- **Monaco Editor** - 文件编辑和 Range 操作

### 架构特点
- ✅ **成熟稳定** - 基于官方维护的 SDK
- ✅ **流式响应** - 实时显示思考过程和执行步骤
- ✅ **简洁高效** - 无需自定义 Agent 引擎
- ✅ **易于扩展** - 通过 `tool()` 函数轻松添加新工具

## 设计目标

- 🎯 **自主执行** - Agent 可以理解用户意图并自动执行复杂任务
- 🔧 **工具系统** - 提供文件操作、搜索等内置工具
- 🔄 **多轮迭代** - 最多 10 步迭代，逐步完成任务
- 📊 **可视化反馈** - 实时显示思考、工具调用和执行结果
- 🚀 **高性能** - 流式响应，不阻塞 UI
- 💾 **对话持久化** - 自动保存对话历史到文件系统

## 系统架构

### 整体架构图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           主窗口 (Main Window)                          │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  LLMBoxFrame (父窗口)                                           │  │
│  │  - 管理 iframe 通信 (bidc)                                        │  │
│  │  - 通过 Assistant.chat() 处理 Agent 请求                          │  │
│  │  - 提供文件操作能力 (window.onote.dataSource)                     │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                              │                                        │
│                              │ bidc 通信                               │
│                              ▼                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  <iframe> llmbox (子窗口)                                       │  │
│  │  ┌────────────────────────────────────────────────────────────────┐  │  │
│  │  │  UI 层 (LLMBox)                                            │  │  │
│  │  │  ├── Header - 显示 Agent 状态                               │  │  │
│  │  │  ├── MessageList - 显示消息和执行步骤                        │  │  │
│  │  │  └── InputArea - 用户输入                                   │  │  │
│  │  ├────────────────────────────────────────────────────────────────┤  │  │
│  │  │  状态管理层 (MobX)                                          │  │  │
│  │  │  ├── AgentStore - Agent 状态和执行步骤管理                   │  │  │
│  │  │  └── AgentConversationStore - 对话持久化                     │  │  │
│  │  ├────────────────────────────────────────────────────────────────┤  │  │
│  │  │  Agent 执行引擎 (Vercel AI SDK)                             │  │  │
│  │  │  ├── ToolLoopAgent - 核心 Agent 引擎                        │  │  │
│  │  │  ├── Assistant - Agent 包装器和流式处理                     │  │  │
│  │  │  └── TOOLS - 工具集合                                      │  │  │
│  │  └────────────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| Agent 引擎 | Vercel AI SDK | 提供 ToolLoopAgent 和流式响应 |
| 状态管理 | MobX | AgentStore 和 AgentConversationStore |
| UI 框架 | React + Fluent UI | 组件库 |
| 通信 | bidc (自定义) | 主窗口和 iframe 之间的双向通信 |
| 工具定义 | Zod | 类型安全的工具参数 Schema |
| 编辑器 | Monaco Editor | 文件编辑和 Range 操作 |

### 核心组件

#### 1. Assistant (Agent 包装器)

**文件位置**: `packages/renderer/src/main/assistant/Assistant.ts`

**职责**:
- 封装 ToolLoopAgent，提供统一的调用接口
- 处理流式响应和事件分发
- 管理执行步骤和工具调用
- 对话持久化

**关键方法**:
```typescript
class Assistant {
  async chat(input: string, callback: (event: AgentStepEvent) => void): Promise<{
    conversationId: string;
    steps: ExecutionStep[];
  }>;

  private async handleStreamChunk(
    chunk: TextStreamPart<any>,
    callback: (event: AgentStepEvent) => void,
  ): Promise<void>;
}
```

**执行流程**:
1. 获取或创建 ToolLoopAgent 实例
2. 构建消息（用户输入 + 当前状态）
3. 流式处理响应
4. 分发事件到回调函数
5. 保存对话历史

#### 2. ToolLoopAgent (Vercel AI SDK)

**文件位置**: `packages/renderer/src/main/assistant/agent.ts`

**职责**:
- 核心引擎，管理 LLM 交互和工具调用
- 支持最多 10 步迭代
- 提供流式响应能力

**配置**:
```typescript
new ToolLoopAgent({
  model: openai(modelName),           // LLM 模型
  instructions: SYSTEM_INSTRUCTIONS,   // 系统提示词
  tools: TOOLS,                       // 可用工具
  stopWhen: stepCountIs(10),          // 最多 10 步
});
```

#### 3. AgentStore (状态管理)

**文件位置**: `packages/renderer/src/llmbox/stores/AgentStore.ts`

**职责**:
- 管理 Agent 状态（idle/thinking/executing）
- 存储执行步骤
- 处理事件和状态更新
- 与 UI 组件集成

**状态**:
```typescript
class AgentStore {
  agentState: 'idle' | 'thinking' | 'executing';
  steps: ExecutionStep[];
  currentMessageId: string | null;
  error: string | null;

  handleEvent(event: AgentStepEvent): void;
}
```

**状态转换**:
```
idle → 用户输入 → thinking → tool_call → executing → thinking → ... → idle
```

#### 4. LLMBox (UI 组件)

**文件位置**: `packages/renderer/src/llmbox/components/LLMBox.tsx`

**职责**:
- 主界面容器
- 管理消息列表
- 处理用户输入
- 显示 Agent 状态和执行步骤

**子组件**:
- `Header` - 显示标题和 Agent 状态
- `MessageList` - 显示消息和执行步骤
- `InputArea` - 用户输入框

#### 5. 工具系统

**文件位置**: `packages/renderer/src/main/assistant/tools.ts`

**职责**:
- 定义所有可用工具
- 使用 Zod 定义参数 Schema
- 实现工具执行逻辑

**工具定义格式**:
```typescript
import { tool } from 'ai';
import { z } from 'zod';

export const readFile = tool({
  description: '读取文件内容（返回格式：`lineNo|lineContent`）',
  inputSchema: z.object({
    uri: z.string().describe('File URI'),
  }),
  execute: async ({ uri }) => {
    // 实现逻辑
  },
});
```

## 工具系统

### 内置工具

| 工具名称 | 描述 | 权限 | 危险 |
|---------|------|-------|-------|
| `readFile` | 读取文件内容（返回格式：`lineNo\|lineContent`） | read | ❌ |
| `writeFile` | 写入文件（覆盖模式） | write | ✅ |
| `listFiles` | 列出目录内容 | read | ❌ |
| `searchInFile` | 文件内搜索 | read | ❌ |
| `applyPatch` | Monaco Range 编辑（增量更新） | write | ✅ |

### 工具定义格式

使用 Vercel AI SDK 的 `tool()` 函数定义工具：

```typescript
import { tool } from 'ai';
import { z } from 'zod';

export const readFile = tool({
  description: 'Read file content from file URI, returns content with line numbers in format: lineNo|lineContent',
  inputSchema: z.object({
    uri: z.string().describe('File URI to read, e.g., file:///path/to/file.md'),
  }),
  execute: async ({ uri }) => {
    const model = await stores.fileStore.getOrCreateModel(uri);
    const content = model.getValue();
    // Add line numbers
    const lines = content.split('\n');
    const numberedLines = lines.map((line, index) => `${index + 1}|${line}`);
    return numberedLines.join('\n');
  },
});
```

### 工具执行流程

```
1. LLM 返回工具调用
   ↓
2. Agent 解析 tool_calls
   ↓
3. 调用工具的 execute 方法
   ↓
4. 工具通过 stores.fileStore 或 window.onote.dataSource 执行操作
   ↓
5. 返回执行结果
   ↓
6. 将结果添加到消息历史
   ↓
7. LLM 基于结果决定下一步行动
```

**说明：**
- 文件读写操作：通过 `stores.fileStore.getOrCreateModel()` 和 `model.getValue()/setValue()`
- 文件保存操作：通过 `stores.fileStore.save()`
- 目录列表操作：通过 `window.onote.dataSource.invoke('list', uri)`
- Monaco 编辑操作：通过 `applyModelEdits()` 应用 Range 编辑

## bidc 通信协议

### 消息类型

**文件位置**: `packages/renderer/src/llmbox/ipc/constants.ts`

```typescript
const LLMBOX_IPC_TYPES = {
  // 发送消息到 Agent
  SEND_MESSAGE: 'SEND_MESSAGE',
} as const;
```

### 通信流程

#### 子窗口 → 主窗口（发送请求）

```typescript
// 子窗口 (LLMBox)
const { sendMessage } = useMainIpc(channel);

// 发送消息并监听事件流
await sendMessage(inputValue, (event: AgentStepEvent) => {
  // 实时接收事件更新
  agentStore.handleEvent(event);
});
```

#### 主窗口处理

```typescript
// 主窗口 (LLMBoxFrame)
receive(async ({ type, data }) => {
  if (type === LLMBOX_IPC_TYPES.SEND_MESSAGE) {
    const { input, callback } = data;
    // 调用 Assistant.chat() 开始 Agent 执行
    const { conversationId, steps } = await assistant.chat(input, callback);
    return { conversationId, steps };
  }
});
```

### 事件类型

**文件位置**: `packages/renderer/src/llmbox/types/AgentEvents.ts`

```typescript
type AgentStepEvent =
  | { type: 'agent-start' }                                  // Agent 开始执行
  | { type: 'agent-complete' }                               // Agent 执行完成
  | { type: 'agent-error'; error: string }                   // Agent 执行出错
  | { type: 'step-start'; step: ExecutionStep }              // 步骤开始
  | { type: 'step-delta'; stepId: string; delta: string }    // 步骤内容增量更新
  | { type: 'step-complete'; stepId: string }                // 步骤完成
  | { type: 'step-error'; stepId: string; error: string };   // 步骤出错
```

## Agent 执行流程

### 完整执行流程图

```
用户输入消息
   ↓
LLMBox.handleSend()
   ↓
通过 bidc 发送 SEND_MESSAGE
   ↓
主窗口接收消息
   ↓
Assistant.chat(input, callback)
   ↓
获取或创建 ToolLoopAgent
   ↓
构建消息（input + buildMessageState()）
   ↓
agent.stream({ messages })
   ↓
┌─────────────────────────────────────┐
│  流式处理循环                        │
│  ↓                                  │
│  for await (chunk of stream)        │
│  ↓                                  │
│  handleStreamChunk(chunk, callback) │
│  ↓                                  │
│  分发事件到 callback                 │
│  ↓                                  │
│  检查是否达到最大迭代次数 (10)       │
│  ↓                                  │
│  继续或结束                          │
└─────────────────────────────────────┘
   ↓
AgentConversationStore.saveConversation()
   ↓
返回 { conversationId, steps }
```

### 流式事件处理

**Assistant.handleStreamChunk()** 处理 Vercel AI SDK 返回的各种事件类型：

| 事件类型 | 处理逻辑 | 派发的事件 |
|---------|---------|-----------|
| `reasoning-start` | 创建 thinking 步骤 | `step-start` (type: 'thinking') |
| `reasoning-delta` | 更新思考内容 | `step-delta` (增量内容) |
| `reasoning-end` | 标记思考完成 | `step-complete` |
| `tool-call` | 创建 tool_call 步骤 | `step-start` (type: 'tool_call') |
| `tool-result` | 更新工具调用结果 | `step-complete` |
| `text-delta` | 忽略（在 summary 中处理） | - |
| `text-end` | 忽略 | - |

### 执行步骤类型

**文件位置**: `packages/renderer/src/llmbox/types/AgentEvents.ts`

```typescript
interface ExecutionStep {
  id: string;
  type: 'thinking' | 'tool_call' | 'summary' | 'error';
  content: string;
  toolCalls?: ToolCall[];  // 仅 tool_call 类型
  isCompleted: boolean;
  timestamp: number;
}
```

| 步骤类型 | 触发时机 | 显示内容 |
|---------|---------|---------|
| `thinking` | LLM 开始思考 | 实时流式显示思考过程 |
| `tool_call` | LLM 调用工具 | 工具名称、参数和结果 |
| `summary` | Agent 最终回答 | 任务完成的总结 |
| `error` | 执行出错 | 错误信息 |

## 状态管理

### AgentStore

**文件位置**: `packages/renderer/src/llmbox/stores/AgentStore.ts`

```typescript
class AgentStore {
  // Agent 状态
  agentState: 'idle' | 'thinking' | 'executing';

  // 执行步骤列表
  steps: ExecutionStep[];

  // 当前消息 ID
  currentMessageId: string | null;

  // 错误信息
  error: string | null;

  // 处理事件
  handleEvent(event: AgentStepEvent): void;

  // 重置状态
  reset(): void;
}
```

### 状态转换图

```
idle (空闲)
   ↓ 用户输入 / agent-start 事件
thinking (思考中)
   ↓ 收到 tool-call 事件
executing (执行工具)
   ↓ 工具执行完成 / 收到 reasoning-start
thinking (思考中) ←
   ↓ 决定继续执行 (收到 tool-call)
executing (执行工具)
   ↓ 任务完成 / 达到最大迭代 / agent-complete
idle (空闲)
   ↓ 发生错误 / agent-error
idle (空闲，设置 error)
```
   ↓
idle (空闲)
```

## 文件组织

```
packages/
├── renderer/src/
│   ├── main/assistant/                   # Agent 核心逻辑
│   │   ├── Assistant.ts                  # Agent 包装器
│   │   ├── agent.ts                      # ToolLoopAgent 创建
│   │   ├── tools.ts                      # 工具定义
│   │   ├── prompts.ts                    # 系统提示词
│   │   ├── AgentConversationStore.ts     # 对话持久化
│   │   └── tests/
│   │       └── tools.test.ts             # 工具测试
│   │
│   ├── llmbox/                           # LLMBox UI 和状态
│   │   ├── components/
│   │   │   ├── LLMBox.tsx                # 主组件
│   │   │   ├── Header.tsx                # 状态栏
│   │   │   ├── MessageList.tsx           # 消息列表
│   │   │   ├── Message.tsx               # 消息项
│   │   │   ├── InputArea.tsx             # 输入区域
│   │   │   └── SessionDivider.tsx        # 会话分割线
│   │   ├── stores/
│   │   │   └── AgentStore.ts             # Agent 状态管理
│   │   ├── types/
│   │   │   ├── AgentEvents.ts            # 事件类型定义
│   │   │   └── IMessage.ts               # 消息类型定义
│   │   └── ipc/
│   │       ├── constants.ts              # IPC 常量
│   │       └── useMainIpc.ts             # IPC Hook
│   │
│   └── main/containers/LLMBox/
│       └── LLMBoxFrame.tsx               # 父窗口容器（处理 bidc）
│
└── electron/src/
    └── (无需修改，通过现有的 DataSource 处理)
```

## 使用示例

### 示例 1: 读取文件并总结

```
用户输入:
"读取 /project/README.md 文件的内容并总结"

Agent 执行:
1. [thinking] 我需要先读取 README.md 文件
2. [tool_call] readFile(uri='file:///project/README.md')
3. [tool_result] 返回文件内容
4. [final_answer] 总结文件内容
```

### 示例 2: 批量修改文件

```
用户输入:
"在 /docs 目录下所有 Markdown 文件开头添加版权声明"

Agent 执行:
1. [thinking] 我需要先找到所有 Markdown 文件
2. [tool_call] listFiles(uri='file:///docs')
3. [tool_result] 返回文件列表
4. [thinking] 过滤出 .md 文件
5. [tool_call] readFile(uri='file:///docs/file1.md')
6. [tool_result] 返回文件内容
7. [thinking] 添加版权声明
8. [tool_call] writeFile(uri='file:///docs/file1.md', content='...')
9. [tool_result] 写入成功
10. [thinking] 处理下一个文件...
11. [final_answer] 已完成所有文件修改
```

### 示例 3: 代码重构

```
用户输入:
"将 utils.ts 中的所有函数添加 JSDoc 注释"

Agent 执行:
1. [thinking] 读取文件内容
2. [tool_call] readFile(uri='file:///src/utils.ts')
3. [tool_result] 返回代码（带行号）
4. [thinking] 分析函数并生成注释
5. [tool_call] writeFile(uri='file:///src/utils.ts', content='带注释的代码')
6. [final_answer] 重构完成
```

### 示例 4: 精确编辑（使用 applyPatch）

```
用户输入:
"将第 5 行的 'hello' 改为 'world'，并在第 10 行后添加一行注释"

Agent 执行:
1. [thinking] 使用 applyPatch 进行精确编辑
2. [tool_call] applyPatch(uri='file:///example.md', patches=[
     {
       "startLine": 5,
       "startColumn": 1,
       "endLine": 5,
       "endColumn": 6,
       "newText": "world"
     },
     {
       "startLine": 10,
       "endLine": 10,
       "newText": "// 这是新增的注释\n"
     }
   ])
3. [tool_result] Successfully applied 2 edit operation(s)
4. [final_answer] 已完成修改
```

**说明：** `applyPatch` 使用 Monaco Editor 的 Range API，支持精确的行列级编辑，比 `writeFile` 更高效。

## 配置选项

### LLM 配置

Agent 使用 ONote 的全局 LLM 设置（通过 `stores.settingStore`）：

| 配置项 | 说明 | 示例 |
|--------|------|------|
| `LLM_BASE_URL` | LLM API 端点 | `https://api.openai.com/v1` |
| `LLM_API_KEY` | API 密钥 | `sk-...` |
| `LLM_MODEL_NAME` | 模型名称 | `gpt-4`, `claude-3-opus` |

### Agent 参数

**文件位置**: `packages/renderer/src/main/assistant/agent.ts`

```typescript
new ToolLoopAgent({
  model: openai(modelName),
  instructions: SYSTEM_INSTRUCTIONS,
  tools: TOOLS,
  stopWhen: stepCountIs(10),  // 最多 10 步迭代
});
```

### 当前实现限制

| 限制项 | 值 | 说明 |
|--------|-----|------|
| 最大迭代次数 | 10 | `stepCountIs(10)` |
| 流式响应 | ✅ 支持 | 实时显示执行过程 |
| 对话持久化 | ✅ 支持 | 自动保存到文件系统 |

## 对话持久化

### AgentConversationStore

**文件位置**: `packages/renderer/src/main/assistant/AgentConversationStore.ts`

**职责**:
- 保存对话历史到文件系统
- 按文件 URI 组织对话
- 管理对话元数据（创建时间、消息数等）

**存储位置**:
```
.onote/llm/conversations/
└── {encoded_file_uri}.json
```

**对话格式**:
```typescript
interface Conversation {
  fileUri: string;
  rootUri: string;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
    steps?: ExecutionStep[];  // 仅 assistant 消息
  }>;
  createdAt: number;
  updatedAt: number;
}
```

## 扩展性

### 添加新工具

在 `packages/renderer/src/main/assistant/tools.ts` 中添加新工具：

```typescript
import { tool } from 'ai';
import { z } from 'zod';
import stores from '../stores';

export const myNewTool = tool({
  description: '工具描述',
  inputSchema: z.object({
    param1: z.string().describe('参数1描述'),
    param2: z.number().optional().describe('参数2描述'),
  }),
  execute: async ({ param1, param2 }) => {
    // 实现逻辑
    // 可以访问:
    // - stores.fileStore
    // - stores.activationStore
    // - window.onote.dataSource
    return '执行结果';
  },
});

// 导出工具
export const TOOLS = {
  // ...existing tools
  myNewTool,
} as const;
```

### 更新系统提示词

在 `packages/renderer/src/main/assistant/prompts.ts` 中更新 `SYSTEM_INSTRUCTIONS`：

```typescript
export const SYSTEM_INSTRUCTIONS = `
你是 ONote 智能助手...
## 可用工具
- myNewTool: 工具描述
...
`;
```

## 设计系统

### 配色方案

#### 亮色模式
| 类型 | 颜色值 | 用途 |
|------|--------|------|
| Primary | `#3b82f6` | 主要按钮、链接 |
| Primary Light | `#60a5fa` | 浅色背景强调 |
| Success | `#10b981` | 成功状态 |
| Warning | `#f59e0b` | 警告状态 |
| Error | `#ef4444` | 错误状态 |
| Primary BG | `#ffffff` | 面板背景 |
| Secondary BG | `#f8f9fa` | 次级背景 |
| Border | `#e5e7eb` | 边框颜色 |
| Primary Text | `#1f2937` | 主要文本 |
| Secondary Text | `#6c757d` | 次要文本 |

#### 深色模式
| 类型 | 颜色值 | 用途 |
|------|--------|------|
| Primary | `#60a5fa` | 主要按钮、链接 |
| Success | `#10b981` | 成功状态 |
| Error | `#ef4444` | 错误状态 |
| Primary BG | `#1e293b` | 面板背景 |
| Secondary BG | `#0f172a` | 次级背景 |
| Tertiary BG | `#334155` | 输入框背景 |
| Primary Text | `#f1f5f9` | 主要文本 |
| Secondary Text | `#94a3b8` | 次要文本 |

### 阴影系统
| 层级 | 阴影值 | 用途 |
|------|--------|------|
| Small | `0 1px 2px rgba(0, 0, 0, 0.05)` | 小元素 |
| Medium | `0 2px 8px rgba(0, 0, 0, 0.1)` | 卡片、按钮 |
| Large | `0 4px 16px rgba(0, 0, 0, 0.15)` | 面板、弹窗 |

### 圆角系统
| 层级 | 圆角值 | 用途 |
|------|--------|------|
| Small | `6px` | 小元素、标签 |
| Medium | `10px` | 卡片、按钮 |
| Large | `16px` | 面板、大元素 |

### 步骤类型视觉区分
| 步骤类型 | 图标 | 边框色 | 背景色 |
|---------|------|--------|--------|
| thinking | 💭 | 蓝色 | 浅蓝背景 |
| tool_call | 🔧 | 橙色 | 浅橙背景 |
| tool_result | ✅ | 绿色 | 浅绿背景 |
| final_answer | 🎯 | 紫色 | 浅紫背景 |
| error | ❌ | 红色 | 浅红背景 |

### 工具图标
| 工具 | 图标 |
|------|------|
| readFile | 📄 |
| writeFile | ✏️ |
| listFiles | 📂 |
| searchInFile | 🔎 |
| applyPatch | 🛠️ |

## 测试策略

### 当前测试覆盖

| 组件 | 测试文件 | 覆盖内容 |
|------|---------|---------|
| applyPatch 工具 | `tools.test.ts` | ✅ 完整测试 |
| 其他工具 | - | ⚠️ 待补充 |
| AgentStore | - | ⚠️ 待补充 |
| UI 组件 | `*.test.tsx` | ✅ 部分覆盖 |

### 运行测试

```bash
# 运行所有测试
yarn test

# 运行特定测试文件
yarn test tools.test.ts

# 监听模式
yarn test:watch
```

## 实现状态

### 已完成 ✅

- [x] **Vercel AI SDK 集成** - 使用 ToolLoopAgent
- [x] **工具系统** - 5 个核心工具（readFile, writeFile, listFiles, searchInFile, applyPatch）
- [x] **状态管理** - AgentStore 和 MobX 集成
- [x] **UI 组件** - LLMBox、Header、MessageList、InputArea
- [x] **bidc 通信** - 主窗口和 iframe 通信
- [x] **对话持久化** - AgentConversationStore
- [x] **流式响应** - 实时显示执行过程
- [x] **applyPatch 测试** - 完整测试覆盖

### 待完成 ⚠️

- [ ] **工具测试** - 其他 4 个工具的单元测试
- [ ] **集成测试** - 端到端工作流测试
- [ ] **错误处理** - 更完善的错误处理和恢复
- [ ] **性能优化** - 大文件处理优化

## 相关文档

- [LLMBox 架构说明](../technical/LLMBox架构说明.md) - AI 对话功能架构
- [LLM 对话持久化实现](../technical/LLM对话持久化实现.md) - 对话历史持久化
- [开发指南](../guides/开发指南.md) - 开发流程和最佳实践

---

**文档版本**: 2.0
**创建日期**: 2026-01-06
**最后更新**: 2026-03-04
**作者**: ONote 开发团队
