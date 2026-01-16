# 任务清单

## 阶段 1: Previewer 取消选中同步

- [x] **P1.1** 修改 `usePreviewerSelection.ts`，增加 `mousedown` 监听预判。
- [x] **P1.2** 在 `mouseup` 逻辑中判断 `selection.isCollapsed` 或内容为空，发送 `content: ''` 事件。
- [x] **P1.3** 验证: 手动点击 Previewer 空白处，LLMBox 选中消失。

## 阶段 2: LLMBox UI 交互优化

- [x] **P2.1** 在 `InputArea.tsx` 的 `.selectionHeader` 中添加关闭按钮。
- [x] **P2.2** 实现 `handleClearSelection` 回调，通过 `channel.send` 发送清空事件。
- [x] **P2.3** 验证: 点击关闭按钮，选中文本消失。

## 阶段 3: 代码整合与验证

- [x] **P3.1** 确认 Store 处理 `content: ''` 的逻辑正确（`selection = ''`）。
- [x] **P3.2** 运行 `yarn lint` & `yarn tsc --noEmit` (packages/renderer)。
