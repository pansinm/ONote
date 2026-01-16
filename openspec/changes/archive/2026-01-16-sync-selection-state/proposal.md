# 提案: 选中文本状态同步与手动关闭

## Why

当前存在两个体验问题：
1. 状态不同步：在 Previewer 中取消选中文本后，LLMBox 中仍保留旧选中。
2. 缺少控制：用户无法在 LLMBox 中主动移除选中文本。

## 摘要

实现选中文本状态在 Previewer 与 LLMBox 之间的双向同步，并增加手动关闭选中文本的能力。

## 背景与目标

当前用户反馈两个问题：
1. **状态不同步**: 在 Previewer 中取消选中文本后，LLMBox 中仍显示旧有选中内容。
2. **缺乏控制**: 用户无法在 LLMBox 侧主动移除已选中的文本。

## 解决方案

### 1. 自动同步 (Previewer -> LLMBox)

修改 `usePreviewerSelection.ts` 钩子，通过检测 `mousedown` 和 `mouseup` 的状态变化，识别"取消选中"操作（点击空白处、滚动选区丢失等），并发送 `content: ''` 事件通知下游清空状态。

### 2. 手动关闭 (UI)

在 `InputArea.tsx` 的选中文本展示区域（`.selectionContainer`）头部增加关闭按钮（"X"）。点击后通过 iframe channel 发送 `EDITOR_SELECTION_CHANGED` (content: '') 事件，通知 Store 清空 `selection`。

## 影响范围

- **packages/renderer/src/previewer/hooks/usePreviewerSelection.ts**: 修改事件监听逻辑。
- **packages/renderer/src/llmbox/components/InputArea.tsx**: 增加关闭按钮及点击处理。
- **packages/renderer/src/llmbox/store/Store.ts**: 增加 `clearSelection` 方法（或复用现有逻辑）。

## 验收标准

- 在 Previewer 中选中文字 -> LLMBox 显示选中。
- 在 Previewer 中点击空白处/滚动导致选中丢失 -> LLMBox 选中自动消失。
- 在 LLMBox 中点击选中区域关闭按钮 -> 选中文本清空，UI 更新。

## 任务拆分

见 `tasks.md`。
