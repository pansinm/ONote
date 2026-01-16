# Tasks: Add Line Numbers to LLM Context

## Phase 1: 核心实现

### Task 1.1: 添加 `addLineNumbers` 工具函数

**Status**: completed

**Description**: 在 `Store.ts` 或新建工具文件中添加 `addLineNumbers` 函数

**Files**:
- `packages/renderer/src/llmbox/store/` 或 `packages/renderer/src/llmbox/utils/`

**Implementation**:
- 实现 `addLineNumbers(content: string): string` 函数
- 函数将文本按行分割，添加 `${lineNumber}: ` 前缀
- 保持空行处理逻辑

**Validation**:
- [x] 函数实现完成，逻辑正确

---

### Task 1.2: 编写 `addLineNumbers` 单元测试

**Status**: completed

**Description**: 为 `addLineNumbers` 函数编写完整的单元测试

**Files**:
- `packages/renderer/src/llmbox/store/__tests__/addLineNumbers.test.ts`
- 或 `packages/renderer/src/llmbox/utils/__tests__/addLineNumbers.test.ts`

**Implementation**:
- 测试普通多行文本
- 测试空行处理
- 测试单行文件
- 测试大文件（边界情况）
- 测试特殊字符和 Unicode
- 测试行尾换行符处理

**Test Cases**:
```typescript
describe('addLineNumbers', () => {
  it('should add line numbers to multi-line text', () => {
    expect(addLineNumbers('line1\nline2\nline3'))
      .toBe('1: line1\n2: line2\n3: line3');
  });

  it('should handle empty lines', () => {
    expect(addLineNumbers('line1\n\nline3'))
      .toBe('1: line1\n2:\n3: line3');
  });

  it('should handle single line', () => {
    expect(addLineNumbers('hello'))
      .toBe('1: hello');
  });

  it('should handle empty string', () => {
    expect(addLineNumbers('')).toBe('');
  });

  it('should handle trailing newline', () => {
    expect(addLineNumbers('line1\nline2\n'))
      .toBe('1: line1\n2: line2\n3:');
  });
});
```

**Validation**:
- [x] 所有单元测试通过
- [x] 覆盖率不低于 80%
- [x] 边界情况测试完整

---

### Task 1.3: 修改 Store 导出工具函数

**Status**: completed

**Description**: 确保 `addLineNumbers` 函数可被其他模块导入使用

**Files**:
- `packages/renderer/src/llmbox/store/index.ts`

**Implementation**:
- 导出 `addLineNumbers` 函数
- 保持一致的导入路径

**Validation**:
- [x] 其他模块可以正确导入函数

---

### Task 1.4: 修改 Agent 消息构建逻辑

**Status**: completed

**Description**: 在 `Agent.ts` 的 `buildMessages` 方法中调用 `addLineNumbers`

**Files**:
- `packages/renderer/src/llmbox/agent/Agent.ts`

**Implementation**:
- 导入 `addLineNumbers` 函数
- 在构建包含编辑器内容的消息时调用该函数
- 注意：仅对编辑器内容添加行号，不影响对话历史

**Validation**:
- [x] 发送到大模型的消息包含行号
- [x] 对话历史中的其他消息不受影响

---

## Phase 2: 集成测试

### Task 2.1: 端到端测试

**Status**: completed

**Description**: 验证大模型能够正确理解带行号的文本并执行替换操作

**Files**:
- `packages/renderer/test/e2e/` 或相关测试文件

**Implementation**:
- 编写集成测试，验证：
  - 带行号的消息正确发送
  - 大模型可以引用行号执行替换
  - 替换结果正确应用

**Validation**:
- [x] 所有端到端测试通过

---

### Task 2.2: 手动验证

**Status**: completed

**Description**: 通过手动测试验证功能正常工作

**Testing Steps**:
1. 打开包含代码的文件
2. 打开 LLMBox 与大模型对话
3. 请求修改指定行号的内容
4. 验证替换操作正确执行

**Validation**:
- [x] 大模型正确理解行号引用
- [x] 文本替换操作按预期工作

---

## Phase 3: 文档更新

### Task 3.1: 更新代码注释

**Status**: completed

**Description**: 为添加的行号相关代码添加适当的注释

**Files**:
- 所有修改的文件

**Implementation**:
- 添加 JSDoc 注释说明函数用途
- 添加内联注释解释关键逻辑

**Validation**:
- [x] 所有公共 API 有文档注释

---

### Task 3.2: 更新 AGENTS.md

**Status**: completed

**Description**: 在 AGENTS.md 中记录行号功能的相关信息

**Files**:
- `AGENTS.md`

**Implementation**:
- 添加行号功能的说明
- 说明与大模型交互时的行号使用方式

**Validation**:
- [x] AGENTS.md 包含相关说明

---

## 依赖关系

```
Task 1.1 (addLineNumbers 函数)
    ↓
Task 1.2 (单元测试)
    ↓
Task 1.3 (导出函数)
    ↓
Task 1.4 (Agent 集成)
    ↓
Task 2.1 (测试) ───→ Task 2.2 (手动验证)
    ↓
Task 3.1 (注释)
    ↓
Task 3.2 (文档)
```

## 可并行执行的任务

- Task 2.1 和 Task 2.2 可以并行（一个自动化，一个手动）
- Task 3.1 和 Task 3.2 可以在代码完成后并行

## 验收标准

- [x] `addLineNumbers` 函数正确工作
- [x] 单元测试覆盖主要场景，覆盖率不低于 80%
- [x] 发送给大模型的消息包含行号
- [x] 大模型可以引用行号执行文本替换
- [x] 所有现有功能不受影响
- [x] 文档和注释完整
