# ONote - Claude Code 项目上下文

## 项目概述

ONote 是一个基于 Electron + React + TypeScript 的跨平台桌面笔记应用。

**技术栈：**
- Electron 35.7.5
- React 18.2.0
- TypeScript 5.3.3
- MobX 6.4.1 (状态管理)
- Monaco Editor 0.45.0 (编辑器)
- Webpack 5 (构建工具)
- Turborepo (Monorepo 管理)

## 项目结构

```
ONote/
├── packages/
│   ├── electron/      # 主进程 (Node.js 环境)
│   │   ├── src/
│   │   │   ├── dataSource/       # 数据源管理
│   │   │   ├── ipc-server/        # IPC 通信服务器
│   │   │   │   └── handlers/      # IPC 处理器
│   │   │   ├── plugin/            # 插件系统
│   │   │   ├── window/            # 窗口管理
│   │   │   ├── server/            # WebDAV 服务器
│   │   │   ├── setting/           # 设置管理
│   │   │   ├── preload/           # 预加载脚本
│   │   │   ├── tunnel/            # 隧道服务
│   │   │   ├── tray/              # 系统托盘
│   │   │   └── index.ts           # 主进程入口
│   │   └── features/              # E2E 测试
│   │
│   ├── renderer/      # 渲染进程 (React 应用)
│   │   ├── src/
│   │   │   ├── main/              # 主应用
│   │   │   │   ├── stores/        # MobX 状态管理
│   │   │   │   ├── containers/    # 容器组件
│   │   │   │   ├── services/      # 服务层
│   │   │   │   ├── App.tsx        # 应用根组件
│   │   │   │   └── index.tsx
│   │   │   ├── components/        # 通用组件
│   │   │   ├── previewer/         # Markdown 预览器
│   │   │   │   └── handlers/      # 渲染处理器
│   │   │   ├── llmbox/            # AI 对话框（对话持久化）
│   │   │   ├── entry/             # 独立入口（llmbox.tsx）
│   │   │   ├── common/            # 通用工具
│   │   │   ├── styles/            # 样式文件
│   │   │   └── monaco/            # Monaco 配置
│   │   └── webpack.config.js
│   │
│   └── shared/        # 主进程和渲染进程共享代码
│       └── src/
│           └── libs/              # 工具库
│
├── docs/               # 项目文档
├── buildResources/     # 构建资源
├── turbo.json         # Turborepo 配置
├── tsconfig.json      # TypeScript 配置
└── package.json       # 根 package.json
```

## 架构要点

### Electron 双进程架构

- **主进程** (`packages/electron`):
  - 运行 Node.js
  - 管理应用生命周期
  - 创建和管理窗口
  - 访问系统资源（文件系统、托盘等）
  - 提供 IPC 服务器

- **渲染进程** (`packages/renderer`):
  - 运行 Chromium
  - React UI 应用
  - 通过 IPC 与主进程通信
  - 不能直接访问 Node.js API（安全考虑）

### IPC 通信模式

```typescript
// 主进程定义 Handler
class DataSourceHandler {
  async list(event, path) {
    return await dataSource.list(path);
  }
}

// 注册 Handler
ipcServer.register(IPCNamespaces.DataSource, DataSourceHandler);

// 渲染进程调用（通过 IPCClient）
const onote = (window as any).onote;
const files = await onote.dataSource.invoke('list', '/path');
```

### MobX 状态管理

```typescript
// Store 定义
class SettingStore {
  theme = 'light';

  constructor() {
    makeAutoObservable(this);
  }

  setTheme(theme: string) {
    this.theme = theme;
  }
}

// 在组件中使用
const ThemedComponent = observer(() => {
  const { settingStore } = stores;
  return <div>{settingStore.theme}</div>;
});
```

### Iframe 通信模式 (bidc)

使用 bidc 库实现 iframe 父子窗口通信：

```typescript
// 父窗口 (主应用)
const { send, receive } = createChannel(iframe.contentWindow, 'MAIN_FRAME-LLM_BOX');

// 发送消息
send({
  type: 'EDITOR_FILE_OPEN',
  data: { uri: 'file:///path/to/file.md' },
});

// 接收消息
receive(async ({ type, data }) => {
  if (type === 'LLM_CONVERSATION_LOAD') {
    const messages = await onote.llmConversation.invoke('loadConversation', data);
    return { messages };
  }
});

// 子窗口
const { send, receive } = createChannel('MAIN_FRAME-LLM_BOX');

// 发送消息
send({
  type: 'LLM_CONVERSATION_LOAD',
  data: { fileUri: 'file:///path/to/file.md' },
});

// 接收消息
receive(({ type, data }) => {
  if (type === 'EDITOR_FILE_OPEN') {
    console.log('File opened:', data.uri);
  }
});
```

## 开发命令

```bash
# 安装依赖
yarn install

# 开发模式（支持热更新）
yarn dev

# 构建
yarn build

# 测试
yarn test

# Lint
yarn lint

# 打包应用
yarn package
```

## 调试技巧

- **渲染进程调试**: 打开 DevTools (F12 或 Ctrl+Shift+I)
- **主进程调试**: 使用 VS Code 的 launch.json 配置
- **IPC 调试**: 在主进程和渲染进程中都添加 console.log

## 重要规范

### 命名规范

- 组件文件: `PascalCase.tsx` (如 `UserProfile.tsx`)
- 工具文件: `kebab-case.ts` (如 `date-utils.ts`)
- Store 文件: `XStore.ts` (如 `UserStore.ts`)

### Git 提交规范

使用 Conventional Commits:
- `feat:` 新功能
- `fix:` Bug 修复
- `docs:` 文档更新
- `refactor:` 重构
- `perf:` 性能优化
- `test:` 测试相关
- `chore:` 构建配置等

示例:
```bash
feat(editor): 添加代码折叠功能
fix(previewer): 修复滚动同步问题
docs: 更新 API 文档
```

## 常见任务

### 添加新的 IPC 方法

1. 在 `packages/electron/src/ipc-server/handlers/` 创建 Handler
2. 在 `packages/electron/src/ipc-server/index.ts` 注册
3. 在 `packages/electron/src/preload/main/onote.ts` 暴露 API
4. 在渲染进程使用 `window.onote.namespace.invoke('methodName', params)` 调用

### 添加新的 MobX Store

1. 在 `packages/renderer/src/main/stores/` 创建 Store
2. 在 `packages/renderer/src/main/stores/index.ts` 注册
3. 在组件中使用 `observer()` 包裹并访问

### 添加新的 Markdown 渲染 Handler

1. 在 `packages/renderer/src/previewer/handlers/` 创建 Handler
2. 在 `packages/renderer/src/previewer/index.ts` 注册到管道

### LLM 对话持久化

**实现位置**:
- 主进程 Handler: `packages/electron/src/ipc-server/handlers/LLMConversationHandler.ts`
- IPC 注册: `packages/electron/src/ipc-server/index.ts`
- Preload 暴露: `packages/electron/src/preload/main/onote.ts`
- 父窗口容器: `packages/renderer/src/main/containers/LLMBox/LLMBoxFrame.tsx`
- 子窗口入口: `packages/renderer/src/entry/llmbox.tsx`
- 状态管理: `packages/renderer/src/llmbox/LLMChatStore.ts`

**使用方法**:
```typescript
// 主进程调用（通过 IPC）
await onote.llmConversation.invoke('loadConversation', {
  fileUri: 'file:///path/to/file.md',
  rootUri: 'file:///path/to/root',
});

await onote.llmConversation.invoke('saveConversation', {
  fileUri: 'file:///path/to/file.md',
  rootUri: 'file:///path/to/root',
  messages: [...],
});
```

**数据存储**:
- 路径: `{rootUri}/.onote/data/{fileHash}/ai/conversation.json`
- 文件名: 通过文件相对路径 MD5 哈希生成

## 项目文档

完整文档目录请查看：[文档中心](./docs/README.md)

### 核心文档
- [架构说明](./docs/overview/架构说明.md) - 系统架构设计
- [新手教程](./docs/guides/新手教程.md) - 快速入门
- [开发指南](./docs/guides/开发指南.md) - 开发流程
- [代码规范](./docs/reference/代码规范.md) - 编码标准
- [常见问题](./docs/reference/常见问题.md) - 问题解答

### 技术文档
- [LLMBox 架构说明](./docs/technical/LLMBox架构说明.md) - AI 对话架构
- [LLM 对话持久化实现](./docs/technical/LLM对话持久化实现.md) - 对话持久化完整实现
- [日志系统使用指南](./docs/technical/日志系统使用指南.md) - 日志系统使用

### 开发指南
- [UI 拖拽调整功能开发指南](./docs/guides/UI拖拽调整功能开发指南.md) - 拖拽功能实现
- [对话复盘-LLMBox 拖拽调整功能](./docs/guides/对话复盘-LLMBox拖拽调整功能.md) - 经验教训总结

### 其他文档
- [插件开发指南](./docs/reference/插件开发指南.md) - 插件开发
- [错误处理使用指南](./docs/reference/错误处理使用指南.md) - 错误处理
- [示例](./docs/examples/示例.md) - 代码示例
- [贡献指南](./CONTRIBUTING.md) - 如何贡献

## 开发经验与最佳实践

### 开发流程

**推荐的开发步骤：**
```
需求分析 → 设计方案 → MVP 实现 → 测试验证
→ 优化改进 → 用户确认 → 提交代码
```

**关键原则：**
1. **测试驱动**：每次修改后运行 `yarn build` 验证
2. **渐进式开发**：先实现基础功能，再优化体验
3. **用户确认**：重要修改前征得用户同意

### 代码修改注意事项

**修改文件前：**
1. 搜索依赖关系：
   ```bash
   grep -r "ComponentName" packages/renderer/src/
   ```
2. 检查是否有其他文件引用
3. 考虑向后兼容性

**删除文件时：**
1. 先确认没有其他引用
2. 如需兼容，创建导出文件：
   ```typescript
   // 向后兼容的导出
   export { NewComponent as OldComponent } from './NewComponent';
   ```
3. 或者修改引用后再删除

### 性能优化原则

**何时优化：**
- ✅ 修复明显的性能问题（如 useEffect 依赖）
- ✅ 移除不必要的 DOM 操作
- ✅ 减少重复计算

**何时不要优化：**
- ❌ 只用一次的逻辑
- ❌ 过度设计，增加复杂度
- ❌ 不必要的 memoization

**优先级：**
1. 高优先级：修复明显的性能问题
2. 中优先级：抽取 Hook、使用 React.memo
3. 低优先级：微优化、过度抽象

### Git 操作规范

**重要：未经用户明确同意，不要执行以下操作：**
- ❌ `git commit`
- ❌ `git push`
- ❌ `git rebase` 或 `git reset`
- ✅ `git add` - 添加到暂存区
- ✅ `git diff` - 查看更改
- ✅ `git status` - 查看状态

**提交流程：**
1. 使用 Conventional Commits 规范
2. 提交前确保 `yarn build` 通过
3. 每次提交聚焦一个功能或修复

### 复杂功能开发

**设计阶段：**
1. 先画架构图
2. 明确边界条件
3. 设计测试方案

**实现阶段：**
1. 拆分为小任务
2. 每个任务完成后验证
3. 及时记录决策原因

**常见模式：**

1. **CSS 变量用于动态布局**
   ```css
   :root {
     --panel-width: 50%;
   }
   .panel {
     width: var(--panel-width);
   }
   ```

2. **window 级别事件监听**
   ```tsx
   useEffect(() => {
     window.addEventListener('mousemove', handleMouseMove);
     return () => {
       window.removeEventListener('mousemove', handleMouseMove);
     };
   }, [dependencies]);
   ```

3. **自定义 Hook 封装逻辑**
   - 场景：跨组件使用相同逻辑
   - 原则：超过 3 个使用就抽象

4. **配置常量集中管理**
   ```typescript
   export const CONFIG = {
     min: 10,
     max: 90,
     default: 50,
   } as const;
   ```

### 问题排查流程

```
发现问题 → 定位原因 → 分析影响 → 设计方案
→ 实现修复 → 测试验证 → 更新文档
```

**常用工具：**
- `grep` - 搜索代码引用
- `git blame` - 查看修改历史
- `git log --oneline` - 查看提交记录
- `yarn build` - 编译检查
- 控制台 DevTools - 调试

### 文档更新

**何时更新文档：**
- ✅ 复杂功能实现后
- ✅ 发现新问题或解决方案
- ✅ API 变更后
- ✅ 重要决策记录

**文档类型：**
1. 开发指南 - 开发流程、最佳实践
2. 技术文档 - 架构设计、实现细节
3. 复盘总结 - 经验教训、改进建议

## Claude Code 使用建议

当需要 Claude Code 帮助时：

1. **代码修改**：明确说明要修改的文件和功能需求
2. **问题排查**：提供错误信息、相关代码和复现步骤
3. **添加功能**：参考"常见任务"部分，说明具体需求
4. **性能优化**：指出具体的性能问题场景
5. **代码审查**：指定需要审查的文件或功能模块

Claude Code 会自动参考：
- 项目结构和架构
- 代码规范和最佳实践
- 现有文档和注释
- 改进计划中的相关建议
