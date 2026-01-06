# AI 对话历史持久化功能 - 实施计划

## 📋 概述

修复 AI 对话历史持久化功能，使其能够：
- ✅ 当用户切换文件时，自动加载该文件的对话历史
- ✅ 当 AI 响应完成后，自动保存对话历史
- ✅ 对话历史存储在文件所在目录：`{文件目录}/.onote/data/{hash}/ai/conversation.json`

---

## 🔍 问题诊断

### 问题 1: ActivationStore.activeFile() 逻辑错误（严重 BUG）

**文件**: `packages/renderer/src/main/stores/ActivationStore.ts:60`

**问题代码**:
```typescript
activeFile(uri: string) {
  if (uri) {
    this.openedFiles = _.uniq([...this.openedFiles, uri]);
  }
  this.activeFileUri = uri;  // 第57行：已更新
  this.activatePage('notebook');

  if (uri && uri !== this.activeFileUri) {  // 第60行：永远为 false！
    eventbus.emit(EDITOR_FILE_OPEN, { uri });
  }
}
```

**影响**: `EDITOR_FILE_OPEN` 事件永远不会触发 → LLMBox 无法加载对话历史

---

### 问题 2: bidc receive 使用方式错误

**文件**: `packages/renderer/src/main/containers/LLMBox/LLMBoxFrame.tsx:50-82`

**问题代码**:
```typescript
receive(async ({ type, data }: any) => {
  if (type === 'LLM_CONVERSATION_LOAD') {
    const messages = await window.onote.llmConversation.loadConversation(fileUri);
    send({  // ❌ 错误：不应该在 receive 中调用 send
      type: 'LLM_CONVERSATION_LOAD_RESPONSE',
      data: { messages },
    });
  }
});
```

**正确用法**: bidc receive 的返回值会**自动作为响应**，不应该手动调用 `send()`。

---

### 问题 3: 架构不一致

- 使用 `eventbus.emit()` 发送文件打开事件
- 但项目其他地方（如 `MainFrame.onTabActivated`）使用 **MobX reaction**
- 不一致的设计模式增加了复杂度

---

## ✅ 解决方案：使用 MobX reaction

**优点**：
- 符合项目架构（插件系统也用 reaction）
- 无需维护额外的事件订阅
- 代码更简洁、更可靠
- 利用 MobX 响应式能力

---

## 📝 详细修改清单

### 修改 1: ActivationStore.ts

**文件**: `packages/renderer/src/main/stores/ActivationStore.ts`

**修改位置**: 第 53-63 行

**当前代码**:
```typescript
activeFile(uri: string) {
  if (uri) {
    this.openedFiles = _.uniq([...this.openedFiles, uri]);
  }
  this.activeFileUri = uri;
  this.activatePage('notebook');

  if (uri && uri !== this.activeFileUri) {
    eventbus.emit(EDITOR_FILE_OPEN, { uri });
  }
}
```

**修改为**:
```typescript
activeFile(uri: string) {
  if (uri) {
    this.openedFiles = _.uniq([...this.openedFiles, uri]);
  }
  this.activeFileUri = uri;
  this.activatePage('notebook');
  // 移除 eventbus.emit()，使用 MobX 的响应式更新
}
```

**修改说明**:
- 移除永远不会触发的 eventbus.emit()
- 移除 `import { eventbus } from '../eventbus'` 和 `import { EDITOR_FILE_OPEN } from '../eventbus/EventName'`

---

### 修改 2: LLMBoxFrame.tsx

**文件**: `packages/renderer/src/main/containers/LLMBox/LLMBoxFrame.tsx`

**修改策略**:
1. 移除 `fileOpened` 订阅（监听 `EDITOR_FILE_OPEN`）
2. 使用 MobX `reaction` 监听 `stores.activationStore.activeFileUri`
3. 修复 `receive` 中的 bidc 使用方式
4. 移除不再使用的导入

**完整修改后的代码**:
```typescript
import React, { useEffect, useRef } from 'react';
import { createChannel } from 'bidc';
import stores from '../../stores';
import { reaction } from 'mobx';
import {
  EDITOR_CONTENT_CHANGED,
  EDITOR_SELECTION_CHANGED,
} from '../../eventbus/EventName';
import { subscription } from '../../eventbus';

function LLMBoxFrame() {
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!ref.current?.contentWindow) return;

    const { send, receive } = createChannel(
      ref.current!.contentWindow!,
      'MAIN_FRAME-LLM_BOX',
    );

    const contentChanged = subscription.subscribe(
      EDITOR_CONTENT_CHANGED,
      (data) => {
        send({
          type: EDITOR_CONTENT_CHANGED,
          data,
        });
      },
    );

    const selectionChanged = subscription.subscribe(
      EDITOR_SELECTION_CHANGED,
      (data) => {
        send({
          type: EDITOR_SELECTION_CHANGED,
          data,
        });
      },
    );

    // 使用 reaction 监听 activeFileUri 变化
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

    // 修复 bidc receive 使用方式：返回值自动作为响应
    receive(async ({ type, data }: any) => {
      if (type === 'LLM_CONVERSATION_LOAD') {
        const { fileUri } = data;
        try {
          const messages = await (window as any).onote.llmConversation.loadConversation(fileUri);
          return { messages };  // 返回值自动作为响应
        } catch (error) {
          return {
            error: error instanceof Error ? error.message : '加载对话历史失败',
          };
        }
      }

      if (type === 'LLM_CONVERSATION_SAVE') {
        const { fileUri, messages } = data;
        try {
          await (window as any).onote.llmConversation.saveConversation(fileUri, messages);
          return { success: true };  // 返回值自动作为响应
        } catch (error) {
          return {
            error: error instanceof Error ? error.message : '保存对话历史失败',
          };
        }
      }
    });

    return () => {
      contentChanged.dispose();
      selectionChanged.dispose();
      activeFileDisposer();
    };
  }, []);

  return (
    <iframe
      ref={ref}
      title="LLMBox"
      style={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        height: '100%',
        width: '100%',
      }}
      src={stores.layoutStore.sidebarUrl}
    />
  );
}

export default LLMBoxFrame;
```

**关键改动**:
- ✅ 添加导入 `reaction` 从 'mobx'
- ✅ 移除导入 `EDITOR_FILE_OPEN`
- ✅ 移除 `fileOpened` 订阅（第 43-48 行）
- ✅ 添加 `activeFileDisposer` reaction 监听 `activeFileUri`（第 44-52 行）
- ✅ 修复 `receive` 返回值：使用 `return` 代替 `send()`（第 54-81 行）
- ✅ 清理函数中添加 `activeFileDisposer()`（第 87 行）

---

### 修改 3: llmbox.tsx

**文件**: `packages/renderer/src/entry/llmbox.tsx`

**修改策略**:
1. 简化 `loadConversation` 和 `saveConversation` 的实现
2. 移除不必要的函数注入到 store
3. 直接在 `receive` 回调中处理所有消息
4. 处理响应消息的类型

**完整修改后的代码**:
```typescript
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { observer } from 'mobx-react-lite';

import { LLMBox } from '../llmbox';
import { LLMChatStore } from '../llmbox/LLMChatStore';
import {
  LLM_API_KEY,
  LLM_BASE_URL,
  LLM_MODEL_NAME,
} from '../common/constants/SettingKey';
import { createChannel } from 'bidc';
import {
  EDITOR_CONTENT_CHANGED,
  EDITOR_SELECTION_CHANGED,
  EDITOR_FILE_OPEN,
} from '../main/eventbus/EventName';
import '../styles/index.scss';
import('github-markdown-css/github-markdown.css');

const { send, receive } = createChannel('MAIN_FRAME-LLM_BOX');

const MyChatComponent: React.FC = observer(() => {
  const settings = (window as any).__settings;
  const [store] = useState(
    () =>
      new LLMChatStore({
        apiKey: settings[LLM_API_KEY],
        model: settings[LLM_MODEL_NAME],
        apiBase: `${settings[LLM_BASE_URL]}/chat/completions`,
      }),
  );

  useEffect(() => {
    if (store.error) {
      alert(store.error);
    }
  }, [store.error]);

  useEffect(() => {
    receive(async ({ type, data }: any) => {
      // 处理来自主窗口的消息
      if (type === EDITOR_FILE_OPEN && data?.uri) {
        store.updateFileUri(data.uri);

        // 加载对话历史
        try {
          const response = await send({
            type: 'LLM_CONVERSATION_LOAD',
            data: { fileUri: data.uri },
          });

          if (response.error) {
            console.error('Failed to load conversation:', response.error);
          } else {
            store.setMessages(response.messages || []);
          }
        } catch (error) {
          console.error('Failed to load conversation:', error);
        }
      }

      if (
        type === EDITOR_CONTENT_CHANGED ||
        type === EDITOR_SELECTION_CHANGED
      ) {
        store.updateEditorContent(data?.content || '', data?.selection || '');
      }
    });
  }, [store]);

  // 注入保存函数到 store（用于 LLM 响应完成后自动保存）
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

**关键改动**:
- ✅ 移除独立的 `loadConversation` 和 `saveConversation` 函数定义（第 34-46 行）
- ✅ 直接在 `receive` 回调中处理 `EDITOR_FILE_OPEN` 并加载对话（第 62-77 行）
- ✅ 使用 `await send()` 等待响应并处理返回值（第 64 行）
- ✅ 直接在组件级别定义并注入 `saveConversationHandler`（第 79-86 行）
- ✅ 处理响应错误（第 72、84 行）

---

## 📦 无需修改的文件

以下文件保持不变（已在之前的实现中正确）：

1. ✅ `packages/electron/src/ipc-server/handlers/LLMConversationHandler.ts`
2. ✅ `packages/electron/src/constants/index.ts`
3. ✅ `packages/electron/src/ipc-server/index.ts`
4. ✅ `packages/electron/src/preload/main/onote.ts`
5. ✅ `packages/renderer/src/llmbox/LLMChatStore.ts`
6. ✅ `packages/renderer/src/main/eventbus/EventName.ts`

---

## 🔄 修改后的通信流程

```
用户切换页签
    │
    ├─> ResourceTabs.onTabActive(tabId)
    │     │
    │     └─> activationStore.activeFile(tabId)
    │            │
    │            ├─> 更新 activeFileUri = tabId
    │            │
    │            └─> MobX reaction 触发
    │                   │
    │                   └─> send({ type: 'EDITOR_FILE_OPEN', data: { uri } })
    │                          │
    │                          v
    │                    llmbox.tsx receive()
    │                          │
    │                          ├─> store.updateFileUri(uri)
    │                          │
    │                          └─> await send({ type: 'LLM_CONVERSATION_LOAD', ... })
    │                                 │
    │                                 v
    │                           LLMBoxFrame receive()
    │                                 │
    │                                 ├─> await window.onote.llmConversation.loadConversation(...)
    │                                 │       │
    │                                 │       v
    │                                 │ 主进程 LLMConversationHandler
    │                                 │       │
    │                                 │       ├─> 读取文件系统
    │                                 │       │
    │                                 │       └─> 返回 messages
    │                                 │
    │                                 └─> return { messages }  // 自动作为响应
    │                                        │
    │                                        v
    │                                  llmbox.tsx send() resolve
    │                                        │
    │                                        └─> store.setMessages(messages)
    │                                               │
    │                                               └─> UI 更新显示历史消息

用户发送消息给 LLM
    │
    ├─> store.sendMessage(content)
    │     │
    │     ├─> 创建用户消息
    │     │
    │     ├─> 调用 LLM API
    │     │
    │     ├─> 流式接收响应
    │     │
    │     └─> completeStreamingMessage()
    │            │
    │            ├─> 更新 messages
    │            │
    │            └─> saveConversation()
    │                   │
    │                   └─> await send({ type: 'LLM_CONVERSATION_SAVE', ... })
    │                          │
    │                          v
    │                    LLMBoxFrame receive()
    │                          │
    │                          ├─> await window.onote.llmConversation.saveConversation(...)
    │                          │       │
    │                          │       v
    │                          │ 主进程 LLMConversationHandler
    │                          │       │
    │                          │       ├─> 写入文件系统
    │                          │       │
    │                          │       └─> 返回 success
    │                          │
    │                          └─> return { success: true }
    │
    └─> 完成
```

---

## ✅ 测试计划

### 功能测试
- [ ] **测试 1**: 打开一个已有对话历史的文件，验证历史是否自动加载
- [ ] **测试 2**: 打开一个新文件，发送消息，等待 AI 响应完成
- [ ] **测试 3**: 切换到另一个文件，再切换回来，验证历史是否保留
- [ ] **测试 4**: 检查 `.onote/data/{hash}/ai/conversation.json` 文件是否正确生成
- [ ] **测试 5**: 验证 JSON 文件格式是否正确

### 集成测试
- [ ] **测试 6**: 验证页签切换时 LLMBox 是否正确更新
- [ ] **测试 7**: 验证编辑器内容变化是否正确同步到 LLMBox
- [ ] **测试 8**: 验证文件切换不会导致消息丢失

### 错误处理测试
- [ ] **测试 9**: 测试加载失败时的错误提示（控制台输出）
- [ ] **测试 10**: 测试保存失败时的错误提示（控制台输出）
- [ ] **测试 11**: 测试文件不存在时的处理（应该返回 null，不报错）

---

## 📊 预期结果

修改完成后：
1. ✅ 用户切换文件时，LLMBox 自动加载该文件的对话历史
2. ✅ AI 响应完成后，对话自动保存到文件系统
3. ✅ 对话历史存储在文件所在目录：`{文件目录}/.onote/data/{hash}/ai/conversation.json`
4. ✅ 代码符合项目架构（使用 MobX reaction）
5. ✅ bidc 通信正确（使用返回值而非手动调用 send）

---

## ⚠️ 风险评估

| 风险 | 级别 | 说明 | 缓解措施 |
|------|------|------|----------|
| MobX reaction 触发时机不当 | 低 | 可能导致文件切换时消息丢失 | 测试验证 reaction 在 activeFileUri 更新后立即触发 |
| bidc 返回值处理错误 | 低 | 响应可能无法正确解析 | 使用 try-catch 捕获错误，打印到控制台 |
| 依赖关系变化 | 极低 | 可能影响其他使用 eventbus 的代码 | 仅移除未使用的 eventbus 导入，不影响其他订阅 |

---

## 📝 后续优化建议

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

## 📅 实施步骤

1. **步骤 1**: 修改 `ActivationStore.ts` - 移除 eventbus.emit()
2. **步骤 2**: 修改 `LLMBoxFrame.tsx` - 使用 reaction，修复 bidc
3. **步骤 3**: 修改 `llmbox.tsx` - 简化逻辑
4. **步骤 4**: 运行 `npm run build` 验证编译
5. **步骤 5**: 运行 `npm run dev` 启动应用
6. **步骤 6**: 执行测试计划中的所有测试用例

---

## 📌 注意事项

- 所有修改都是向后兼容的
- 不影响现有功能
- 仅修复 bug 和改进架构
- 错误仅在控制台输出，不影响用户体验
