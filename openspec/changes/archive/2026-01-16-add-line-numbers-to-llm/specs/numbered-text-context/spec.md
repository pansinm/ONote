# Numbered Text Context

## Purpose

为发送给大模型的文本内容自动添加行号，使大模型能够进行更精确的文本引用和替换操作。

## ADDED Requirements

### Requirement: 自动为编辑器内容添加行号

当编辑器内容需要发送给大模型时，系统 MUST 自动为每一行添加行号前缀，格式为 `${lineNumber}: ${content}`。

用户可以在编辑器中打开一个文件，内容为：
```markdown
# Title
This is a paragraph.
const x = 1;
```

当文本内容被传递给大模型时，大模型收到的内容必须为：
```markdown
1: # Title
2: This is a paragraph.
3: const x = 1;
```

#### Scenario: 空行处理
- **Given** 编辑器内容包含空行：
  ```markdown
  # Title
  
  const x = 1;
  ```
- **When** 文本内容被传递给大模型
- **Then** 空行必须保持行号连续性：
  ```markdown
  1: # Title
  2:
  3: const x = 1;
  ```

#### Scenario: 单行文件
- **Given** 编辑器内容只有一行：`const x = 1;`
- **When** 文本内容被传递给大模型
- **Then** 行号正确添加：
  ```markdown
  1: const x = 1;
  ```

#### Scenario: 大文件
- **Given** 编辑器内容有 1000 行
- **When** 文本内容被传递给大模型
- **Then** 行号从 1 连续编号到 1000，每行正确添加行号前缀

### Requirement: 大模型可以引用行号进行文本替换

系统 MUST 支持大模型通过引用行号来执行文本替换操作，与现有的 `line_number` 和 `line_range` 替换模式配合工作。

大模型收到的内容带行号：
```markdown
1: function hello() {
2:   console.log('hello');
3: }
```

当大模型请求 "将第 2 行的 'hello' 改为 'world'" 时，系统 MUST 解析行号引用，执行对应的文本替换操作，替换操作使用现有的 `line_number` 模式。

#### Scenario: 单行引用
- **Given** 带行号的文件内容
- **When** 大模型请求替换指定行号的内容
- **Then** 系统 MUST 使用 `line_number` 模式执行替换

#### Scenario: 多行范围引用
- **Given** 带行号的文件内容
- **When** 大模型请求替换指定行号范围的内容
- **Then** 系统 MUST 使用 `line_range` 模式执行替换

### Requirement: 原始编辑器内容保持不变

系统 MUST 保证添加行号操作不影响编辑器中显示的原始内容。

用户可以在编辑器中看到内容 `const x = 1;`，当该内容被发送给大模型时，编辑器中显示的内容 MUST 保持不变，仅有发送给大模型的消息被添加行号。

#### Scenario: 编辑器显示不受影响
- **Given** 用户在编辑器中打开文件，内容为：
  ```typescript
  const x = 1;
  const y = 2;
  ```
- **When** 用户与 LLM 对话，请求修改代码
- **Then** 编辑器中显示的内容 MUST 保持为原始内容
  ```
  const x = 1;
  const y = 2;
  ```
- **And** 发送给大模型的内容包含行号：
  ```
  1: const x = 1;
  2: const y = 2;
  ```

### Requirement: 行号格式一致性

系统 MUST 保证行号格式与现有 `AgentFileHandler.ts` 中的行号格式保持一致。

格式 MUST 为 `${lineNumber}: `（行号后跟冒号和空格），行号从 1 开始连续编号，行号无补零，右对齐自然宽度。

#### Scenario: 行号格式验证
- **Given** 多行文本内容：
  ```markdown
  line one
  line two
  line three
  ```
- **When** 添加行号
- **Then** 格式必须一致：
  ```markdown
  1: line one
  2: line two
  3: line three
  ```
- **And** 行号后必须跟冒号和空格

#### Scenario: 与 AgentFileHandler 格式一致
- **Given** `AgentFileHandler.ts` 中使用的行号格式
- **When** 比较行号添加函数的输出
- **Then** 格式必须与 `line_number` 替换模式中的行号格式一致

### Requirement: Store 文本内容处理

Store.ts MUST 提供工具函数用于为文本内容添加行号。

需要将编辑器内容发送给大模型时，必须使用 `addLineNumbers(content)` 函数处理原始内容，处理后的内容仅用于消息构建，不修改 Store 中存储的原始内容。

**Related**: Agent 消息构建

#### Scenario: addLineNumbers 函数使用
- **Given** Store 中存储的原始内容为：
  ```typescript
  function hello() {
    return 'world';
  }
  ```
- **When** 调用 `addLineNumbers(content)` 函数
- **Then** 返回带行号的内容：
  ```typescript
  1: function hello() {
  2:   return 'world';
  3: }
  ```
- **And** Store 中存储的原始内容保持不变

#### Scenario: 工具函数导出
- **Given** `addLineNumbers` 函数已实现
- **When** 其他模块导入该函数
- **Then** 函数可以被成功导入
- **And** 函数行为符合预期

### Requirement: Agent 消息构建

Agent.ts MUST 在构建发送给大模型的消息时，自动为编辑器内容添加行号。

构建包含编辑器内容的用户消息时，必须调用 `addLineNumbers()` 为内容添加行号，添加行号后的内容作为消息内容发送给大模型。

**Related**: Store 文本内容处理

#### Scenario: 消息构建时添加行号
- **Given** Store 中编辑器内容为：
  ```typescript
  const x = 1;
  const y = 2;
  ```
- **When** Agent 构建用户消息
- **Then** 消息内容必须包含行号：
  ```
  1: const x = 1;
  2: const y = 2;
  ```
- **And** 发送给大模型的消息包含带行号的内容

#### Scenario: 对话历史不受影响
- **Given** 对话历史中已有消息
- **When** 构建新消息
- **Then** 对话历史中的消息 MUST 不被添加行号
- **And** 仅当前用户消息中的编辑器内容被添加行号

## Implementation Notes

- 行号添加逻辑应集中在 `Store.ts` 或专门的工具模块中
- 消息构建时动态添加行号，不修改 Store 原始数据
- 与现有的 `line_number` 和 `line_range` 替换模式无缝集成
