# AGENTS.md - AI 代码助手指南

本文件为 AI 编程助手提供 ONote 项目的基本信息和开发指南。

## 项目概述

ONote 是基于 Electron + React + TypeScript 的跨平台桌面笔记应用。

**技术栈：**
- Electron 35.7.5
- React 18.2.0
- TypeScript 5.3.3
- MobX 6.4.1 (状态管理)
- Monaco Editor 0.45.0 (编辑器)
- Webpack 5 (构建工具)
- Turborepo (Monorepo 管理)

## 架构

### Electron 双进程架构

**主进程** (`packages/electron`):
- 运行 Node.js
- 管理应用生命周期
- 创建和管理窗口
- 访问系统资源（文件系统、托盘等）
- 提供 IPC 服务器

**渲染进程** (`packages/renderer`):
- 运行 Chromium
- React UI 应用
- 通过 IPC 与主进程通信
- 不能直接访问 Node.js API（安全考虑）

### IPC 通信

```typescript
// 主进程 - 定义 Handler
class DataSourceHandler {
  async list(event, path) {
    return await dataSource.list(path);
  }
}

// 注册 Handler
ipcServer.register(IPCNamespaces.DataSource, DataSourceHandler);

// 渲染进程 - 通过 IPCClient 调用
const onote = (window as any).onote;
const files = await onote.dataSource.invoke('list', '/path');
```

### Iframe 通信 (bidc)

```typescript
// 父窗口 (主应用)
const { send, receive } = createChannel(iframe.contentWindow, 'MAIN_FRAME-LLM_BOX');

send({ type: 'EDITOR_FILE_OPEN', data: { uri: 'file:///path/to/file.md' } });

receive(async ({ type, data }) => {
  if (type === 'LLM_CONVERSATION_LOAD') {
    const messages = await onote.llmConversation.invoke('loadConversation', data);
    return { messages };
  }
});

// 子窗口
const { send, receive } = createChannel('MAIN_FRAME-LLM_BOX');
send({ type: 'LLM_CONVERSATION_LOAD', data: { fileUri: 'file:///path/to/file.md' } });
```

## 常用命令

### 构建
```bash
yarn build                                    # 完整构建
yarn workspace onote-renderer build           # 单包构建
yarn package                                  # 打包应用
```

### 测试
```bash
yarn test                                     # 运行所有测试
yarn test:watch                               # 监听模式
yarn test -- path/to/file.test.ts             # 单个测试文件
yarn test -- --testNamePattern="description"  # 测试模式
yarn test:e2e                                 # E2E 测试 (Cucumber)
yarn bdd                                      # 监听 E2E 测试
```

### 代码检查
```bash
yarn lint             # Lint 检查
yarn lint --fix       # 自动修复
yarn tsc --noEmit     # 类型检查
```

### 开发
```bash
yarn install          # 安装依赖
yarn dev             # 启动开发服务器（热更新）
```

## 项目结构

```
packages/
├── electron/      # 主进程 (Node.js) - IPC handlers, 窗口管理
│   └── src/
│       ├── dataSource/       # 数据源管理
│       ├── ipc-server/        # IPC 通信服务器
│       │   └── handlers/      # IPC 处理器
│       ├── window/            # 窗口管理
│       ├── server/            # WebDAV 服务器
│       ├── setting/           # 设置管理
│       ├── preload/           # 预加载脚本
│       └── index.ts           # 主进程入口
├── renderer/      # 渲染进程 (React) - UI 组件, 状态管理
│   └── src/
│       ├── main/              # 主应用
│       │   ├── stores/        # MobX 状态管理
│       │   ├── containers/    # 容器组件
│       │   ├── services/      # 服务层
│       │   └── App.tsx        # 应用根组件
│       ├── components/        # 通用组件
│       ├── previewer/         # Markdown 预览器
│       │   └── handlers/      # 渲染处理器
│       ├── llmbox/            # AI 对话框
│       ├── entry/             # 独立入口 (llmbox.tsx)
│       ├── common/            # 通用工具
│       └── monaco/            # Monaco 配置
└── shared/        # 主进程和渲染进程共享代码
    └── src/
        └── libs/              # 工具库
```

## 调试

- **渲染进程**: 打开 DevTools (F12 或 Ctrl+Shift+I)
- **主进程**: 使用 VS Code launch.json 配置
- **IPC 调试**: 在主进程和渲染进程中都添加 console.log

## 代码规范

### 导入顺序
```typescript
// 顺序: React → 第三方库 → 内部 → 类型 → 样式 → 工具
import React, { FC, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Button } from '@fluentui/react-components';
import type { AppProps } from './types';
import styles from './App.module.scss';
import { getLogger } from '/@/shared/logger';

// 类型导入使用 'import type'
import type { TreeNode } from '@sinm/react-file-tree';

// 使用路径别名:
import { dataSource } from '/@/dataSource';
import { pathUtil } from '/@/shared/libs';
```

### 格式化
- 分号: 必须使用
- 引号: 单引号
- 尾随逗号: 多行对象/数组中必须使用
- 缩进: 2 空格，无制表符

### TypeScript 规则
- 启用严格模式
- 禁止隐式 any - 使用显式类型或 `unknown`
- 强制类型导入: `import type { T } from 'module'`
- 对象形状用 interface，联合类型用 type

### 命名规范
```typescript
// 文件
Component.tsx           // 组件: PascalCase
util.ts                 // 工具: kebab-case
UserStore.ts            // Store: XStore 模式

// 变量
const userId = '123';   // camelCase
function getData() {}   // camelCase
const isLoading = true; // 布尔值: is/has/can 前缀
const MAX_COUNT = 100;  // 常量: UPPER_SNAKE_CASE

// 接口/类型
interface User {}        // PascalCase
type Theme = 'light' | 'dark'; // PascalCase

// 类
class DataSourceHandler extends IpcHandler {}
```

### React 组件
```typescript
const MyComponent: FC<Props> = ({ title, onAction }) => {
  const [state, setState] = useState();
  const { store } = stores;

  useEffect(() => {
    return () => {};
  }, [dependencies]);

  const handleClick = useCallback(() => {}, []);

  return <div className={styles.container}>{title}</div>;
};

// MobX 组件必须使用 observer
const ObservedComponent = observer(() => {
  const { userStore } = stores;
  return <div>{userStore.count}</div>;
});
```

### MobX 状态管理
```typescript
import { makeAutoObservable, runInAction } from 'mobx';

class MyStore {
  data: Data[] = [];
  loading = false;

  constructor() {
    makeAutoObservable(this);
  }

  async loadData() {
    this.loading = true;
    try {
      const result = await api.fetch();
      runInAction(() => {
        this.data = result;
        this.loading = false;
      });
    } catch (error) {
      logger.error('Failed to load data', error);
      runInAction(() => { this.loading = false; });
    }
  }
}
```

### 错误处理
```typescript
async function loadData(): Promise<Data | null> {
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    logger.error('Failed to load data', error);
    return null;
  }
}

// 检查特定错误类型
if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
  logger.debug('File not found', { path });
  return null;
}
```

### 日志
```typescript
import { getLogger } from '/@/shared/logger';
const logger = getLogger('ComponentName');
logger.debug('Debug message', { context: data });
logger.error('Error occurred', error);
```

### IPC (主进程)
```typescript
class MyHandler extends IpcHandler {
  async myMethod(event, param: string): Promise<Result> {
    logger.debug('Method called', { param });
    return await doWork(param);
  }
}
ipcServer.register(IPCNamespaces.MyNamespace, MyHandler);
```

### CSS Modules

**命名规则：**
- CSS 类名使用 PascalCase（首字母大写）
- TypeScript 中使用 PascalCase 访问

**PascalCase 命名规则：**
```scss
// SCSS 文件
.MyComponent {
  &.MyComponentActive { ... }
  &.MyComponentDisabled { ... }
}
```

```typescript
// TypeScript 文件
import styles from './Component.module.scss';
<div className={styles.MyComponent}>           // ✅ 使用 PascalCase
<div className={styles.MyComponentActive}>      // ✅ PascalCase
<div className={styles.MyComponentDisabled}>    // ✅ PascalCase
```

**复合类名：**
```scss
// SCSS 文件
.LogItem {
  &.LogItemThinking { ... }
  &.LogItemToolCall { ... }
}
```

```typescript
// TypeScript 文件
<div className={`${styles.LogItem} ${styles.LogItemThinking}`}>  // ✅ PascalCase
<div className={`${styles.LogItem} ${styles.LogItemToolCall}`}>  // ✅ PascalCase
```

**动态类名：**
```scss
// SCSS 文件
.StateIdle { ... }
.StateThinking { ... }
.StateExecuting { ... }
```

```typescript
// TypeScript 文件
<div className={`${styles.Container} ${styles['State' + capitalize(store.agentState)]}`}>
```

### 测试
```typescript
describe('Feature', () => {
  it('should do something', () => {
    expect(result).toBe(expected);
  });
  it('should handle async', async () => {
    await expect(asyncFunction()).resolves.toBe(value);
  });
});
```

## 常见任务

### 添加新的 IPC 方法
1. 在 `packages/electron/src/ipc-server/handlers/` 创建 Handler
2. 在 `packages/electron/src/ipc-server/index.ts` 注册
3. 在 `packages/electron/src/preload/main/onote.ts` 暴露 API
4. 在渲染进程调用: `window.onote.namespace.invoke('methodName', params)`

### 添加新的 MobX Store
1. 在 `packages/renderer/src/main/stores/` 创建 Store
2. 在 `packages/renderer/src/main/stores/index.ts` 注册
3. 在组件中使用 `observer()` 包裹

### 添加新的 Markdown 渲染 Handler
1. 在 `packages/renderer/src/previewer/handlers/` 创建 Handler
2. 在 `packages/renderer/src/previewer/index.ts` 注册到管道

## Git 操作

### 提交规范 (Conventional Commits)
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

### Git 工作流
**重要: 未经用户明确同意，不要执行以下操作:**
- ❌ `git commit`
- ❌ `git push`
- ❌ `git rebase` 或 `git reset`
- ✅ `git add` - 添加到暂存区
- ✅ `git diff` - 查看更改
- ✅ `git status` - 查看状态

## 开发最佳实践

### 开发流程
1. 需求分析 → 设计方案 → MVP 实现 → 测试验证 → 优化改进 → 用户确认 → 提交代码
2. 测试驱动: 每次修改后运行 `yarn build` 验证
3. 渐进式开发: 先实现基础功能，再优化体验

### 性能优化
**何时优化:**
- ✅ 修复明显的性能问题（如 useEffect 依赖）
- ✅ 移除不必要的 DOM 操作
- ✅ 减少重复计算

**何时不要优化:**
- ❌ 只用一次的逻辑
- ❌ 过度设计，增加复杂度
- ❌ 不必要的 memoization

### 代码修改注意事项
**修改文件前:**
1. 搜索依赖关系: `grep -r "ComponentName" packages/renderer/src/`
2. 检查是否有其他引用
3. 考虑向后兼容性

**删除文件时:**
1. 先确认没有其他引用
2. 如需兼容，创建导出文件:
   ```typescript
   export { NewComponent as OldComponent } from './NewComponent';
   ```

### 常见模式

**CSS 变量用于动态布局:**
```css
:root {
  --panel-width: 50%;
}
.panel {
  width: var(--panel-width);
}
```

**window 级别事件监听:**
```tsx
useEffect(() => {
  window.addEventListener('mousemove', handleMouseMove);
  return () => {
    window.removeEventListener('mousemove', handleMouseMove);
  };
}, [dependencies]);
```

**自定义 Hook:**
- 场景: 跨组件使用相同逻辑
- 原则: 超过 3 个使用就抽象

**CSS Module 正确使用:**
```tsx
// ✅ 正确: 在 SCSS 中定义所有变体
.LogItem {
  &.LogItemThinking { ... }
  &.LogItemToolCall { ... }
}

<div className={`${styles.LogItem} ${styles['LogItem' + capitalize(step.type)]}`}>

// ✅ 正确: 使用模板字符串混合
<div className={`${styles.Container} ${someCondition ? 'active' : ''}`}>
```

**配置常量:**
```typescript
export const CONFIG = {
  min: 10,
  max: 90,
  default: 50,
} as const;
```

## 核心模式

### MobX 异步状态更新
```typescript
async load() {
  const data = await fetchData();
  runInAction(() => { this.items = data; });
}
```

### 类型守卫
```typescript
function isUser(value: unknown): value is User {
  return typeof value === 'object' && value !== null && 'id' in value;
}
```

### 路径别名
- `/@/*` → packages/electron/src 或 packages/renderer/src
- `/@/shared/*` → packages/shared/src

### 禁止注释
除非用户明确要求，否则不要添加注释。

## 相关文档

- [架构说明](./docs/overview/架构说明.md)
- [新手教程](./docs/guides/新手教程.md)
- [开发指南](./docs/guides/开发指南.md)
- [代码规范](./docs/reference/代码规范.md)
- [常见问题](./docs/reference/常见问题.md)
- [LLMBox 架构说明](./docs/technical/LLMBox架构说明.md)
- [LLM 对话持久化实现](./docs/technical/LLM对话持久化实现.md)
- [日志系统使用指南](./docs/technical/日志系统使用指南.md)
