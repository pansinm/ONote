# Project Context

## Purpose
ONote 是基于 Electron + React + TypeScript 的跨平台桌面笔记应用。

## Tech Stack
- Electron 35.7.5
- React 18.2.0
- TypeScript 5.3.3
- MobX 6.4.1 (状态管理)
- Monaco Editor 0.45.0 (编辑器)
- Webpack 5 (构建工具)
- Turborepo (Monorepo 管理)

## Project Conventions

### Code Style
- 分号: 必须使用
- 引号: 单引号
- 尾随逗号: 多行对象/数组中必须使用
- 缩进: 2 空格，无制表符

### Architecture Patterns
- Electron 双进程架构（主进程 + 渲染进程）
- IPC 通信机制
- MobX 状态管理
- React 函数式组件

### Testing Strategy

#### 单元测试
- 所有工具函数必须编写单元测试
- 测试文件与源文件同名，后缀为 `.test.ts` 或 `.test.tsx`
- 测试文件放在源文件同目录的 `__tests__` 子目录中
- 测试覆盖率要求不低于 80%
- 使用 Jest 作为测试框架

**示例目录结构**:
```
src/
├── utils/
│   ├── string.ts              # 源文件
│   └── __tests__/
│       └── string.test.ts     # 单元测试
```

**示例测试**:
```typescript
describe('stringUtils', () => {
  it('should add line numbers to text', () => {
    expect(addLineNumbers('a\nb')).toBe('1: a\n2: b');
  });
});
```

#### 集成测试
- 核心业务流程使用集成测试
- 使用 E2E 测试框架（Cucumber）

### Git Workflow
- Git Flow 工作流
- Conventional Commits 提交规范
- 功能开发在 feature 分支进行

## Domain Context
[Add domain-specific knowledge that AI assistants need to understand]

## Important Constraints
[List any technical, business, or regulatory constraints]

## External Dependencies
[Document key external services, APIs, or systems]
