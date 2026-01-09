# replaceFileContent 工具使用说明

## 概述

`replaceFileContent` 工具用于替换文件中的部分内容，适用于局部修改、bug 修复、代码重构等场景。相比于 `writeFile` 全量输出，可以大幅节省 token 消耗。

## 功能特性

- **多种替换模式**：支持字符串替换、正则表达式替换、行范围替换、单行替换
- **批量操作**：一次工具调用可以执行多个替换操作
- **预览功能**：支持预览修改结果而不实际写入文件
- **详细反馈**：返回被修改的行号、匹配次数等详细信息

## 替换模式

### 1. 字符串替换 (mode: "string")

最常用的替换模式，支持普通字符串匹配和替换。

```json
{
  "uri": "file:///Users/notes/code.js",
  "operations": [
    {
      "mode": "string",
      "search": "oldFunction",
      "replace": "newFunction",
      "replaceAll": true,
      "caseSensitive": true
    }
  ]
}
```

**参数说明：**
- `search`: 要搜索的字符串
- `replace`: 替换内容
- `replaceAll`: 是否替换所有匹配项（默认 false）
- `caseSensitive`: 是否区分大小写（默认 false）

**使用场景：**
- 变量名重命名
- 修复简单的拼写错误
- 更新重复的代码片段

### 2. 正则表达式替换 (mode: "regex")

支持正则表达式的高级替换模式。

```json
{
  "operations": [
    {
      "mode": "regex",
      "search": "function\\s+(\\w+)\\s*\\(([^)]*)\\)",
      "replace": "const $1 = ($2) => {}"
    }
  ]
}
```

**参数说明：**
- `search`: 正则表达式模式
- `replace`: 替换内容（支持 `$1`, `$2` 等捕获组）

**使用场景：**
- 批量修改代码模式
- 复杂的文本替换
- 使用捕获组进行高级替换

### 3. 行范围替换 (mode: "line_range")

替换指定范围内的所有行。

```json
{
  "operations": [
    {
      "mode": "line_range",
      "lineStart": 10,
      "lineEnd": 20,
      "replace": "// 新的实现\nconst x = 1;\nconst y = 2;"
    }
  ]
}
```

**参数说明：**
- `lineStart`: 起始行号（从 1 开始）
- `lineEnd`: 结束行号（包含）
- `replace`: 替换内容（可以包含多行）

**使用场景：**
- 替换函数体
- 修改配置块
- 替换大段代码

### 4. 单行替换 (mode: "line_number")

替换指定行。

```json
{
  "operations": [
    {
      "mode": "line_number",
      "search": "15",
      "replace": "const updatedValue = 42;"
    }
  ]
}
```

**参数说明：**
- `search`: 行号（字符串格式，如 "15"）
- `replace`: 替换内容

**使用场景：**
- 修改单行代码
- 更新配置值
- 修改注释

## 批量操作

可以在一次工具调用中执行多个替换操作：

```json
{
  "operations": [
    {
      "mode": "string",
      "search": "oldVar",
      "replace": "newVar",
      "replaceAll": true
    },
    {
      "mode": "string",
      "search": "deprecated()",
      "replace": "newFunction()"
    },
    {
      "mode": "line_number",
      "search": "100",
      "replace": "// Updated comment"
    }
  ]
}
```

## 预览功能

设置 `preview: true` 可以预览修改结果而不实际写入文件：

```json
{
  "uri": "file:///Users/notes/code.js",
  "operations": [...],
  "preview": true
}
```

**返回值示例：**
```json
{
  "success": true,
  "preview": "修改后的完整内容...",
  "modifiedLines": [5, 10, 15],
  "operations": [
    {
      "success": true,
      "matches": 3,
      "changedLines": [5, 10, 15]
    }
  ]
}
```

## 返回值说明

```typescript
{
  success: boolean;          // 操作是否成功
  preview?: string;          // 预览模式下的修改后内容
  modifiedLines?: number[];   // 所有被修改的行号（按升序排列）
  operations?: [             // 每个操作的详细结果
    {
      success: boolean;      // 操作是否成功
      matches: number;       // 匹配次数
      changedLines: number[]; // 被修改的行号
      error?: string;        // 错误信息（如果失败）
    }
  ]
}
```

## 使用建议

### 何时使用 replaceFileContent

- ✅ 局部修改：只修改文件的一小部分
- ✅ 批量替换：多处相同的修改
- ✅ 准确定位：可以通过搜索或行号准确定位
- ✅ 节省 token：避免输出整个文件内容

### 何时使用 writeFile

- ✅ 全量重写：需要完全重写文件内容
- ✅ 大范围重构：修改涉及整个文件结构
- ✅ 生成新内容：从头生成新文件
- ✅ 无法定位：无法通过搜索或行号定位要修改的内容

### 最佳实践

1. **优先使用 replaceFileContent**：对于局部修改，优先使用此工具
2. **使用预览模式**：对于重要修改，先预览再确认
3. **批量操作**：将多个相关替换操作合并为一次调用
4. **精确搜索**：使用足够精确的搜索字符串，避免误替换
5. **正则表达式**：对于复杂替换，考虑使用正则表达式模式

## 常见问题

### Q: 如何处理多个替换操作对同一行的修改？

A: 多个操作会按顺序执行，后面的操作会在前面操作的结果上继续执行。如果同一行被多次修改，最后一次操作的结果为准。

### Q: 正则表达式替换如何使用捕获组？

A: 使用 `$1`, `$2` 等引用捕获组。例如：
```json
{
  "mode": "regex",
  "search": "const (\\w+) = (\\w+)",
  "replace": "let $1 = $2"
}
```

### Q: 如何替换跨多行的内容？

A: 使用 `line_range` 模式，或者在 `search` 中使用包含 `\n` 的正则表达式。

### Q: 预览模式会修改文件吗？

A: 不会。预览模式只返回修改后的内容，不会写入文件。

## 示例场景

### 场景 1：修复 bug

**问题描述：** 将所有 `parseInt(x)` 改为 `Number(x)` 以避免 base-10 的问题

```json
{
  "operations": [
    {
      "mode": "regex",
      "search": "parseInt\\(([^)]+)\\)",
      "replace": "Number($1)"
    }
  ]
}
```

### 场景 2：更新导入语句

**问题描述：** 将所有 `import { x } from './old'` 改为 `import { x } from './new'`

```json
{
  "operations": [
    {
      "mode": "string",
      "search": "from './old'",
      "replace": "from './new'",
      "replaceAll": true
    }
  ]
}
```

### 场景 3：替换函数实现

**问题描述：** 替换第 10-20 行的函数实现

```json
{
  "operations": [
    {
      "mode": "line_range",
      "lineStart": 10,
      "lineEnd": 20,
      "replace": "function newImplementation() {\n  // 新的实现\n  return true;\n}"
    }
  ]
}
```

### 场景 4：批量修改变量名

**问题描述：** 将所有 `userData` 改为 `userProfile`

```json
{
  "operations": [
    {
      "mode": "string",
      "search": "userData",
      "replace": "userProfile",
      "replaceAll": true,
      "caseSensitive": true
    }
  ]
}
```

## 注意事项

1. **行号从 1 开始**：与大多数编辑器一致
2. **字符串替换是字面匹配**：会自动转义特殊字符
3. **正则表达式使用 JavaScript 语法**：遵循 JavaScript RegExp 规则
4. **行范围包含边界**：`lineStart` 和 `lineEnd` 都会被替换
5. **原子性**：所有操作要么全部成功，要么全部失败
