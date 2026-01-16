# Design: Add Line Numbers to LLM Context

## Architecture Overview

### Current Architecture

```
Editor Content → Store.content → Agent.buildMessages → LLMClient.stream → LLM API
```

### Proposed Architecture

```
Editor Content → AddLineNumbers(content) → Store.content → Agent.buildMessages → LLMClient.stream → LLM API
```

## Key Design Decisions

### 1. Where to Add Line Numbers

**Option A: 在 Store 层添加行号**
- 优点：统一管理，所有使用 Store.content 的地方自动获得行号
- 缺点：Store 本身的值被修改，可能影响其他用途

**Option B: 在构建消息时动态添加**
- 优点：不影响 Store 原始值，仅在发送给 LLM 时添加
- 缺点：需要在多处构建消息的代码中添加逻辑

**Selected: Option B**
- 保持 Store 原始数据不变
- 明确数据流：原始内容 → 带行号内容 → 发送给 LLM
- 便于调试和测试

### 2. Line Number Format

**Option A: `1: content`** (1 字符行号)
**Option B: `001: content`** (3 字符补零)
**Option C: `  1: content`** (2 字符右对齐)

**Selected: Option A `1: content`**
- 最简洁，token 消耗最少
- 大模型容易理解
- 与现有 `AgentFileHandler.ts` 中的行号格式一致

### 3. Handling Empty Lines

- 空行应显示为空行号：`2:` 后直接换行
- 保持行的连续性，大模型可以正确理解行号

## Implementation Details

### Core Function

```typescript
function addLineNumbers(content: string): string {
  return content
    .split('\n')
    .map((line, index) => `${index + 1}: ${line}`)
    .join('\n');
}
```

### Integration Points

1. **Store.ts** - 添加 `addLineNumbers` 工具函数
2. **Agent.ts** - 在 `buildMessages` 时对编辑器内容调用 `addLineNumbers`
3. **消息类型** - 可能需要区分"原始内容"和"带行号内容"

### Example

**原始内容:**
```markdown
# Title
This is a paragraph.
const x = 1;
```

**带行号内容:**
```markdown
1: # Title
2: This is a paragraph.
3: const x = 1;
```

## Trade-offs

| Decision | Pros | Cons |
|----------|------|------|
| 动态添加行号 | 保持原始数据，支持调试 | 需要多处修改 |
| 简洁格式 `1:` | 最少 token，简单易懂 | 行号位数变化时对齐可能不整齐 |
| 所有消息添加 | 统一行为 | 部分消息可能不需要 |

## Future Considerations

1. **可配置格式**：允许用户自定义行号格式
2. **选择性启用**：仅在特定对话或文件类型时启用
3. **智能行号**：仅添加用户引用过的行号（更复杂，可能不必要）
