# AI 对话历史持久化功能 - 实施完成报告

## ✅ 实施状态：已完成

**完成时间**: 2025-01-06
**修改文件数**: 3
**构建状态**: ✅ 通过
**Lint 状态**: ✅ 通过

---

## 📝 修改清单

### 1. ActivationStore.ts

**文件**: `packages/renderer/src/main/stores/ActivationStore.ts`

**修改内容**:
- ✅ 移除第 1-6 行：删除未使用的 `eventbus` 和 `EDITOR_FILE_OPEN` 导入
- ✅ 修改第 53-63 行：修复 `activeFile()` 方法，移除永远不会触发的 `eventbus.emit()`

**关键修复**:
```typescript
// 修复前
activeFile(uri: string) {
  // ...
  this.activeFileUri = uri;  // 已更新
  // ...
  if (uri && uri !== this.activeFileUri) {  // 永远为 false！
    eventbus.emit(EDITOR_FILE_OPEN, { uri });
  }
}

// 修复后
activeFile(uri: string) {
  if (uri) {
    this.openedFiles = _.uniq([...this.openedFiles, uri]);
  }
  this.activeFileUri = uri;
  this.activatePage('notebook');
  // 依赖 MobX 响应式更新
}
```

---

### 2. LLMBoxFrame.tsx

**文件**: `packages/renderer/src/main/containers/LLMBox/LLMBoxFrame.tsx`

**修改内容**:
- ✅ 添加导入：`reaction` 从 'mobx'
- ✅ 移除导入：`eventbus` 和 `EDITOR_FILE_OPEN`
- ✅ 移除第 43-48 行：删除 `fileOpened` 订阅
- ✅ 添加第 44-52 行：使用 `reaction` 监听 `activeFileUri` 变化
- ✅ 修改第 50-82 行：修复 `receive` 回调，使用 `return` 代替 `send()`
- ✅ 修改第 87 行：清理函数中添加 `activeFileDisposer()`

**关键改进**:
```typescript
// 修复前：错误的 bidc 使用方式
receive(async ({ type, data }: any) => {
  if (type === 'LLM_CONVERSATION_LOAD') {
    const messages = await window.onote.llmConversation.loadConversation(fileUri);
    send({  // ❌ 不应该在 receive 中调用 send
      type: 'LLM_CONVERSATION_LOAD_RESPONSE',
      data: { messages },
    });
  }
});

// 修复后：正确的 bidc 使用方式
receive(async ({ type, data }: any) => {
  if (type === 'LLM_CONVERSATION_LOAD') {
    const { fileUri } = data;
    try {
      const messages = await (window as any).onote.llmConversation.loadConversation(fileUri);
      return { messages };  // ✅ 返回值自动作为响应
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : '加载对话历史失败',
      };
    }
  }
});

// 使用 reaction 监听文件切换
const activeFileDisposer = reaction(
  () => stores.activationStore.activeFileUri,
  (uri) => {
    if (uri) {
      send({
        type: 'EDITOR_FILE_OPEN',
        data: { uri },
      });
    }
  },
);
```

---

### 3. llmbox.tsx

**文件**: `packages/renderer/src/entry/llmbox.tsx`

**修改内容**:
- ✅ 移除第 34-46 行：删除独立的 `loadConversation` 和 `saveConversation` 函数
- ✅ 修改第 54-81 行：在 `receive` 回调中直接处理 `EDITOR_FILE_OPEN` 并加载对话
- ✅ 修改第 64 行：使用 `await send()` 等待响应
- ✅ 添加第 79-86 行：在组件级别定义 `saveConversationHandler`
- ✅ 添加类型注解：`as { error?: string; messages?: any[] }`

**关键改进**:
```typescript
// 修复前：复杂的函数注入
const loadConversation = async (fileUri: string): Promise<void> => {
  send({ type: 'LLM_CONVERSATION_LOAD', data: { fileUri } });
};

const saveConversation = async (fileUri: string, messages: any[]): Promise<void> => {
  send({ type: 'LLM_CONVERSATION_SAVE', data: { fileUri, messages } });
};

receive(async ({ type, data }: any) => {
  if (type === EDITOR_FILE_OPEN && data?.uri) {
    store.updateFileUri(data.uri);
    await store.setLoadConversation(loadConversation);
    await store.setSaveConversation(saveConversation);
    await store.loadConversation();
  }
  if (type === 'LLM_CONVERSATION_LOAD_RESPONSE') {
    if (data.error) {
      console.error('Failed to load conversation:', data.error);
    } else {
      store.setMessages(data.messages || []);
    }
  }
  // ...
});

// 修复后：简洁的实现
receive(async ({ type, data }: any) => {
  if (type === EDITOR_FILE_OPEN && data?.uri) {
    store.updateFileUri(data.uri);

    try {
      const response = await send({
        type: 'LLM_CONVERSATION_LOAD',
        data: { fileUri: data.uri },
      }) as { error?: string; messages?: any[] };

      if (response.error) {
        console.error('Failed to load conversation:', response.error);
      } else {
        store.setMessages(response.messages || []);
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  }
  // ...
});

const saveConversationHandler = async (fileUri: string, messages: any[]) => {
  try {
    await send({
      type: 'LLM_CONVERSATION_SAVE',
      data: { fileUri, messages },
    });
  } catch (error) {
    console.error('Failed to save conversation:', error);
  }
};

store.setSaveConversation(saveConversationHandler);
```

---

## 🎯 功能说明

### 核心功能

1. **自动加载对话历史**
   - 当用户切换文件时，自动加载该文件的对话历史
   - 对话历史存储在文件所在目录：`{文件目录}/.onote/data/{hash}/ai/conversation.json`

2. **自动保存对话历史**
   - 当 AI 响应完成后，自动保存对话到文件系统
   - 保存时机：`completeStreamingMessage()` → `saveConversation()`

3. **符合项目架构**
   - 使用 MobX `reaction` 监听状态变化（与其他插件一致）
   - 移除不必要的 eventbus 订阅
   - 正确使用 bidc 的返回值机制

### 通信流程

```
用户切换页签
    ↓
activationStore.activeFile(uri)
    ↓
activeFileUri 更新
    ↓
MobX reaction 触发
    ↓
send({ type: 'EDITOR_FILE_OPEN', data: { uri } })
    ↓
llmbox.tsx receive(EDITOR_FILE_OPEN)
    ↓
updateFileUri(uri)
    ↓
await send({ type: 'LLM_CONVERSATION_LOAD', ... })
    ↓
LLMBoxFrame receive(LLM_CONVERSATION_LOAD)
    ↓
await window.onote.llmConversation.loadConversation(fileUri)
    ↓
主进程 LLMConversationHandler
    ↓
读取文件系统: .onote/data/{hash}/ai/conversation.json
    ↓
return { messages }
    ↓
llmbox.tsx 接收响应
    ↓
store.setMessages(messages)
    ↓
UI 更新显示历史消息
```

---

## 🧪 测试指南

### 基本功能测试

#### 测试 1：加载对话历史
1. 打开一个已有对话历史的文件（如果之前保存过）
2. 观察 LLMBox 是否自动显示历史消息
3. ✅ 预期：消息列表中显示之前的历史对话

#### 测试 2：保存对话历史
1. 打开一个新文件
2. 在 LLMBox 中发送一条消息
3. 等待 AI 响应完成
4. 检查文件目录下是否生成了 `.onote/data/{hash}/ai/conversation.json`
5. ✅ 预期：
   - 文件存在
   - JSON 格式正确
   - 包含用户消息和 AI 响应

#### 测试 3：文件切换
1. 打开文件 A，发送消息并等待响应
2. 切换到文件 B
3. 再切换回文件 A
4. ✅ 预期：文件 A 的对话历史仍然保留

### 集成测试

#### 测试 4：页签切换
1. 打开多个文件
2. 点击不同页签
3. ✅ 预期：LLMBox 正确更新显示当前文件的对话历史

#### 测试 5：编辑器同步
1. 在编辑器中选择文本
2. ✅ 预期：LLMBox 中的上下文信息正确更新

#### 测试 6：文件不存在
1. 打开一个从未保存过对话历史的文件
2. ✅ 预期：LLMBox 显示空的对话列表，不报错

### 错误处理测试

#### 测试 7：加载失败
1. 手动损坏 `.onote/data/{hash}/ai/conversation.json` 文件
2. 打开对应的文件
3. ✅ 预期：控制台输出错误信息，UI 不受影响

#### 测试 8：保存失败
1. 模拟文件系统权限错误
2. 发送消息并等待 AI 响应
3. ✅ 预期：控制台输出错误信息，UI 不受影响

---

## 📊 存储结构

### 对话历史文件位置

```
{文件所在目录}/
├── .onote/
│   └── data/
│       └── {md5_hash_of_file_path}/
│           └── ai/
│               └── conversation.json
└── {filename}.md
```

### JSON 格式示例

```json
[
  {
    "id": "message-xxx",
    "content": "用户消息内容",
    "role": "user",
    "timestamp": "2025-01-06T10:00:00.000Z"
  },
  {
    "id": "message-yyy",
    "content": "AI 响应内容",
    "role": "assistant",
    "timestamp": "2025-01-06T10:00:01.000Z"
  }
]
```

---

## 📌 注意事项

### 当前限制

1. **文件移动/重命名**
   - 如果文件被移动或重命名，对话历史会丢失（因为 hash 基于路径）
   - 未来改进：使用文件内容 hash 或其他唯一标识

2. **错误处理**
   - 加载/保存失败时只在控制台输出错误
   - 未来改进：在 UI 上显示错误提示

3. **性能**
   - 当前是全量保存，每次 AI 响应完成后保存所有消息
   - 未来改进：增量保存，只保存新增的消息

### 已知问题

- `github-markdown-css` 的类型声明错误（不影响功能）

---

## ✅ 验证结果

### 构建验证
```bash
npm run build
```
- ✅ 编译成功
- ✅ 无致命错误
- ⚠️ 有 2 个警告（bundle size 超过推荐限制，这是正常现象）

### Lint 验证
```bash
npm run lint
```
- ✅ 无新增 lint 错误
- ⚠️ 有一些已存在的警告（与本次修改无关）

---

## 🚀 下一步

### 立即可用
- ✅ 功能已完整实现
- ✅ 构建通过
- ✅ 可以开始测试

### 后续优化建议

1. **性能优化**
   - 实现增量保存（只保存新增的消息）
   - 对话历史压缩存储

2. **功能增强**
   - 对话历史管理 UI（查看、删除历史）
   - 对话历史导出/导入功能
   - 对话历史自动清理策略

3. **用户体验**
   - 加载对话历史时显示加载状态
   - 保存失败时的重试机制
   - 对话历史版本控制

---

## 📞 问题反馈

如果遇到问题，请：
1. 打开浏览器控制台查看错误信息
2. 检查 `.onote/data/` 目录下是否正确生成了文件
3. 验证 JSON 文件格式是否正确

---

## 📝 总结

**实施完成** ✅
- 修复了 3 个关键问题
- 代码符合项目架构
- 构建和 lint 通过
- 功能可以开始测试

**关键改进**:
1. ✅ 修复 ActivationStore.activeFile() 的逻辑 BUG
2. ✅ 修复 bidc receive 的使用方式
3. ✅ 使用 MobX reaction 替代 eventbus
4. ✅ 简化代码逻辑

**预期效果**:
- 用户切换文件时，自动加载对话历史
- AI 响应完成后，自动保存对话
- 对话历史存储在文件所在目录
